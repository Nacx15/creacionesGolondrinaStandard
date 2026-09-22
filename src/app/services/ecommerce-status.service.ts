import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {DestroyRef, Injectable, PLATFORM_ID, inject, signal} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {firstValueFrom} from 'rxjs';
import {environment} from '../../environments/environment';
import {EcommerceShippingConfiguration, ShippingEstimate, estimateShipping, parseShippingConfiguration} from './shipping-rule.util';

export type EcommerceRuntimeStatus = 'checking' | 'active' | 'maintenance' | 'inactive' | 'unavailable';

@Injectable({providedIn: 'root'})
export class EcommerceStatusService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly browser = isPlatformBrowser(this.platformId);

  readonly status = signal<EcommerceRuntimeStatus>('checking');
  readonly message = signal<string | null>(null);
  readonly shipping = signal<EcommerceShippingConfiguration | null>(null);

  estimateShipping(itemCount: number, subtotal: number): ShippingEstimate | null {
    return estimateShipping(this.shipping(), itemCount, subtotal);
  }

  private inFlight?: Promise<EcommerceRuntimeStatus>;
  private lastValidatedAt = 0;
  private lastShippingValidatedAt = 0;
  private hiddenAt = 0;
  private runtimeRefreshStarted = false;
  private lastResumeCheckAt = 0;

  /**
   * Returns the cached state while it is fresh. A new request is only performed when
   * the cache expires, when there is no reliable state yet, or when the caller forces it.
   * 403/503 responses from any GuayaFlow request still update this service immediately
   * through the global error interceptor, so the status endpoint does not need polling.
   */
  ensureStatus(force = false): Promise<EcommerceRuntimeStatus> {
    if (this.inFlight) return this.inFlight;

    const current = this.status();
    if (!force && this.isFresh(current)) {
      return Promise.resolve(current);
    }

    this.inFlight = this.fetchStatus().finally(() => {
      this.inFlight = undefined;
    });
    return this.inFlight;
  }

  /**
   * Allows the global HTTP interceptor to immediately synchronize the storefront
   * when any GuayaFlow request reports an authoritative ecommerce state.
   */
  setFromHttpState(status: EcommerceRuntimeStatus, message?: string | null): void {
    this.status.set(status);
    this.message.set(message?.trim() || null);
    if (status !== 'active') {
      this.shipping.set(null);
      this.lastShippingValidatedAt = 0;
    }
    this.lastValidatedAt = Date.now();
  }

  /**
   * Event-driven status refresh. There is intentionally no interval/polling here.
   * While active, ordinary GuayaFlow calls are enough to surface 403/503 immediately.
   * Volver de otra pestaña o recuperar la conexión reconsulta también las reglas de
   * envío si la tienda sigue activa, sin hacer polling de status por cada cambio de carrito.
   */
  startRuntimeRefresh(): void {
    if (!this.browser || this.runtimeRefreshStarted) return;
    this.runtimeRefreshStarted = true;

    const refreshBlockedState = () => {
      const now = Date.now();
      if (now - this.lastResumeCheckAt < 1000) return;
      this.lastResumeCheckAt = now;

      const current = this.status();
      if (current !== 'active' || this.hiddenAt > 0) {
        this.hiddenAt = 0;
        void this.ensureStatus(true);
      }
    };

    const refreshWhenVisible = () => {
      if (document.visibilityState === 'hidden') this.hiddenAt = Date.now();
      else refreshBlockedState();
    };
    const refreshWhenOnline = () => {
      this.hiddenAt = Date.now();
      refreshBlockedState();
    };

    window.addEventListener('focus', refreshBlockedState);
    window.addEventListener('online', refreshWhenOnline);
    document.addEventListener('visibilitychange', refreshWhenVisible);

    this.destroyRef.onDestroy(() => {
      window.removeEventListener('focus', refreshBlockedState);
      window.removeEventListener('online', refreshWhenOnline);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
      this.runtimeRefreshStarted = false;
    });
  }

  private isFresh(current: EcommerceRuntimeStatus): boolean {
    if (this.lastValidatedAt <= 0 || current === 'checking') return false;

    const age = Date.now() - this.lastValidatedAt;
    if (current === 'unavailable') {
      const retryMs = Math.max(5000, Number(environment.ecommerceStatusRetryMs ?? 30000));
      return age < retryMs;
    }

    // El catálogo protegido confirma estado activo, pero NO actualiza la versión
    // de la configuración de envío. Se conserva un TTL independiente.
    const ttlMs = Math.max(1000, Number(environment.ecommerceStatusTtlMs ?? 3000));
    if (current === 'active') {
      return this.shipping() !== null &&
        this.lastShippingValidatedAt > 0 &&
        Date.now() - this.lastShippingValidatedAt < ttlMs;
    }
    return age < ttlMs;
  }

  private async fetchStatus(): Promise<EcommerceRuntimeStatus> {
    try {
      const response = await firstValueFrom(this.http.get<any>(`${environment.apiUrl}/ecommerce/status`));
      const raw = String(response?.status ?? response?.ecommerce_status ?? response?.data?.status ?? '').toLowerCase();
      const next: EcommerceRuntimeStatus = raw === 'active' || raw === 'maintenance' || raw === 'inactive' ? raw : 'unavailable';
      const message = response?.message ?? response?.data?.message ?? null;
      this.setFromHttpState(next, typeof message === 'string' ? message : null);
      if (next === 'active') {
        // Solo data.shipping del status, no tarifas heredadas ni valores del catálogo.
        this.shipping.set(parseShippingConfiguration(response?.data?.shipping));
        this.lastShippingValidatedAt = this.shipping() ? Date.now() : 0;
      }
      return next;
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        const code = String(error.error?.code ?? '').toLowerCase();
        const message = error.error?.message ?? error.error?.mensajeError ?? null;

        if (error.status === 403 && (code === 'ecommerce_inactive' || String(error.error?.status ?? '').toLowerCase() === 'inactive')) {
          this.setFromHttpState('inactive', typeof message === 'string' ? message : null);
          return 'inactive';
        }

        if (error.status === 503 && (
          code === 'ecommerce_maintenance' ||
          code === 'ecommerce_configuration_unavailable' ||
          String(error.error?.status ?? '').toLowerCase() === 'maintenance'
        )) {
          this.setFromHttpState('maintenance', typeof message === 'string' ? message : null);
          return 'maintenance';
        }
      }

      this.setFromHttpState('unavailable', null);
      return 'unavailable';
    }
  }
}
