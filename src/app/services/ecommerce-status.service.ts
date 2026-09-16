import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {DestroyRef, Injectable, PLATFORM_ID, inject, isDevMode, signal} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {firstValueFrom} from 'rxjs';
import {environment} from '../../environments/environment';

export type EcommerceRuntimeStatus = 'checking' | 'active' | 'maintenance' | 'inactive' | 'unavailable';

@Injectable({providedIn: 'root'})
export class EcommerceStatusService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly browser = isPlatformBrowser(this.platformId);

  readonly status = signal<EcommerceRuntimeStatus>('checking');
  readonly message = signal<string | null>(null);
  private inFlight?: Promise<EcommerceRuntimeStatus>;
  private monitorId?: number;
  private monitoringStarted = false;

  ensureStatus(force = false): Promise<EcommerceRuntimeStatus> {
    if (!force && this.status() !== 'checking' && this.status() !== 'unavailable') {
      return Promise.resolve(this.status());
    }

    // Reuse the current request even when a forced refresh is requested. This prevents
    // duplicate /ecommerce/status calls when a route guard and the runtime monitor fire together.
    if (this.inFlight) return this.inFlight;

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
  }

  /**
   * Keeps the storefront synchronized with GuayaFlow while the browser remains open.
   * Guards still validate on navigation; this monitor covers status changes that happen
   * while the visitor stays on the same route.
   */
  startMonitoring(): void {
    if (!this.browser || this.monitoringStarted) return;
    this.monitoringStarted = true;

    const intervalMs = Math.max(5000, Number(environment.ecommerceStatusPollMs ?? 10000));
    const refresh = () => {
      void this.ensureStatus(true);
    };
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };

    this.monitorId = window.setInterval(refresh, intervalMs);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refreshWhenVisible);

    this.destroyRef.onDestroy(() => {
      if (this.monitorId !== undefined) window.clearInterval(this.monitorId);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
      this.monitorId = undefined;
      this.monitoringStarted = false;
    });

    if (isDevMode()) {
      // No user data is logged; this is only useful while validating status propagation.
      console.debug(`[GuayaFlow] ecommerce status monitor: ${intervalMs}ms`);
    }
  }

  private async fetchStatus(): Promise<EcommerceRuntimeStatus> {
    try {
      const response = await firstValueFrom(this.http.get<any>(`${environment.apiUrl}/ecommerce/status`));
      const raw = String(response?.status ?? response?.ecommerce_status ?? response?.data?.status ?? '').toLowerCase();
      const next: EcommerceRuntimeStatus = raw === 'active' || raw === 'maintenance' || raw === 'inactive' ? raw : 'unavailable';
      const message = response?.message ?? response?.data?.message ?? null;
      this.setFromHttpState(next, typeof message === 'string' ? message : null);
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
