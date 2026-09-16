import {ChangeDetectionStrategy, Component, OnDestroy, PLATFORM_ID, computed, inject, signal} from '@angular/core';
import {CommonModule, isPlatformBrowser} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {firstValueFrom} from 'rxjs';
import {Store} from '../components/store';
import {CheckoutSession, CheckoutSessionService} from '../services/checkout-session.service';
import {ToastService} from '../services/toast.service';
import {getApiErrorMessage} from '../shared/http/api-error.util';

interface OrderStatusPayload {
  sale_id?: string | number;
  sale_status?: string;
  payment_status?: string;
  status?: string;
  amount_paid?: number;
  balance_due?: number;
  total?: number;
  total_amount?: number;
  payment_provider?: string | null;
  provider_payment_id?: string | number | null;
  reservation_expires_at?: string | null;
  reservation?: {
    state?: string | null;
    expires_at?: string | null;
    released_at?: string | null;
    release_reason?: string | null;
  } | null;
  updated_at?: string | null;
  message?: string;
}

interface OrderStatusResponse extends OrderStatusPayload {
  success?: boolean;
  data?: OrderStatusPayload;
}

type ResultMode = 'success' | 'pending' | 'failure';
type ViewState = 'checking' | 'approved' | 'pending' | 'terminal' | 'error';

@Component({
  selector: 'app-payment-result',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="py-20 bg-brand-cream min-h-[65vh] flex items-center">
      <div class="container mx-auto px-4">
        <div class="max-w-2xl mx-auto bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
          <div class="p-8 md:p-12 text-center">
            @if (viewState() === 'checking') {
              <div class="w-16 h-16 rounded-full bg-brand-light-pink text-brand-pink flex items-center justify-center mx-auto mb-5"><mat-icon class="text-3xl animate-spin">sync</mat-icon></div>
              <h1 class="font-serif-brand text-3xl font-bold text-gray-900 mb-3">Estamos confirmando tu pago</h1>
              <p class="text-gray-500">La página de regreso no aprueba el pedido por sí sola. Estamos consultando el estado firmado de GuayaFlow mientras el webhook confirma el pago.</p>
            } @else if (viewState() === 'approved') {
              <div class="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-5"><mat-icon class="text-3xl">check_circle</mat-icon></div>
              <h1 class="font-serif-brand text-3xl font-bold text-gray-900 mb-3">Pago confirmado</h1>
              <p class="text-gray-500 mb-5">GuayaFlow confirmó la venta y el pago. Tu carrito ya fue limpiado.</p>
            } @else if (viewState() === 'pending') {
              <div class="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-5"><mat-icon class="text-3xl">schedule</mat-icon></div>
              <h1 class="font-serif-brand text-3xl font-bold text-gray-900 mb-3">Pago pendiente de confirmación</h1>
              <p class="text-gray-500 mb-6">Tu pedido existente sigue en validación. No crearemos otra venta. Puedes volver a consultar su estado.</p>
            } @else if (viewState() === 'terminal') {
              <div class="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-5"><mat-icon class="text-3xl">cancel</mat-icon></div>
              <h1 class="font-serif-brand text-3xl font-bold text-gray-900 mb-3">El pago no se completó</h1>
              <p class="text-gray-500 mb-6">El estado firmado del pedido es terminal. Puedes recuperar el carrito; las existencias y precios se validarán nuevamente contra el catálogo actual.</p>
            } @else {
              <div class="w-16 h-16 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center mx-auto mb-5"><mat-icon class="text-3xl">error_outline</mat-icon></div>
              <h1 class="font-serif-brand text-3xl font-bold text-gray-900 mb-3">No pudimos confirmar el estado</h1>
              <p class="text-gray-500 mb-6">{{ errorMessage() }}</p>
            }

            @if (statusDetail(); as current) {
              <div class="mt-7 max-w-lg mx-auto bg-brand-cream border border-gray-100 rounded-2xl p-5 text-left space-y-2">
                <div class="flex justify-between gap-4 text-xs"><span class="text-gray-500">Pedido</span><span class="font-bold text-gray-900">#{{ current.sale_id || session()?.saleId }}</span></div>
                <div class="flex justify-between gap-4 text-xs"><span class="text-gray-500">Estado del pedido</span><span class="font-bold text-gray-900 uppercase">{{ saleStatusLabel(current.sale_status || '') }}</span></div>
                <div class="flex justify-between gap-4 text-xs"><span class="text-gray-500">Estado del pago</span><span class="font-bold text-gray-900 uppercase">{{ paymentStatusLabel(current.payment_status || '') }}</span></div>
                @if (current.total !== undefined && current.total !== null) {
                  <div class="flex justify-between gap-4 text-xs"><span class="text-gray-500">Total confirmado</span><span class="font-bold text-gray-900">{{ current.total | currency:'MXN':'symbol-narrow':'1.2-2' }}</span></div>
                }
                @if (current.provider_payment_id) {
                  <div class="border-t border-gray-200 mt-3 pt-3">
                    <p class="text-[10px] uppercase tracking-wider text-gray-400">Payment ID</p>
                    <p class="text-xs text-gray-700 font-mono break-all mt-1">{{ current.provider_payment_id }}</p>
                  </div>
                }
                @if (current.reservation?.state) {
                  <div class="border-t border-gray-200 mt-3 pt-3 text-xs">
                    <div class="flex justify-between gap-4"><span class="text-gray-500">Reserva</span><span class="font-bold text-gray-900 uppercase">{{ reservationStatusLabel(current.reservation?.state || '') }}</span></div>
                    @if (current.reservation?.expires_at) {
                      <p class="text-gray-500 mt-2">Vigencia: <strong class="text-gray-900">{{ current.reservation?.expires_at | date:'short' }}</strong></p>
                    }
                  </div>
                }
              </div>
            } @else if (session(); as localSession) {
              <div class="mt-7 max-w-lg mx-auto bg-brand-cream border border-gray-100 rounded-2xl p-5 text-left space-y-2">
                <div class="flex justify-between gap-4 text-xs"><span class="text-gray-500">Pedido</span><span class="font-bold text-gray-900">#{{ localSession.saleId }}</span></div>
                <div class="flex justify-between gap-4 text-xs"><span class="text-gray-500">Total registrado</span><span class="font-bold text-gray-900">{{ localSession.totals.total | currency:'MXN':'symbol-narrow':'1.2-2' }}</span></div>
                @if (localSession.reservationExpiresAt) {
                  <p class="text-xs text-gray-500">Reserva registrada hasta: <strong class="text-gray-900">{{ localSession.reservationExpiresAt | date:'short' }}</strong></p>
                }
              </div>
            }

            <div class="mt-7 flex flex-col sm:flex-row justify-center gap-3">
              @if (viewState() === 'approved') {
                <a routerLink="/catalogo" class="inline-flex justify-center bg-brand-pink text-white px-7 py-3 rounded-full font-semibold">Seguir explorando</a>
              } @else if (viewState() === 'terminal') {
                <button (click)="recoverCart()" [disabled]="loading()" class="bg-brand-pink text-white px-7 py-3 rounded-full font-semibold disabled:opacity-50">Recuperar carrito</button>
                <a routerLink="/catalogo" class="inline-flex justify-center border border-gray-200 text-gray-700 px-7 py-3 rounded-full font-semibold">Ver catálogo</a>
              } @else if (session()) {
                <button (click)="refresh()" [disabled]="loading()" class="bg-brand-pink text-white px-7 py-3 rounded-full font-semibold disabled:opacity-50">Consultar estado</button>
              }
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class PaymentResult implements OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sessions = inject(CheckoutSessionService);
  private readonly store = inject(Store);
  private readonly toast = inject(ToastService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly mode = signal<ResultMode>((this.route.snapshot.data['mode'] as ResultMode) || 'pending');
  readonly session = signal<CheckoutSession | null>(this.sessions.get());
  readonly statusDetail = signal<OrderStatusPayload | null>(null);
  readonly viewState = signal<ViewState>('checking');
  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly isBrowser = computed(() => isPlatformBrowser(this.platformId));
  private timer?: ReturnType<typeof setTimeout>;
  private attempts = 0;

  constructor() { void this.refresh(true); }
  ngOnDestroy() { if (this.timer) clearTimeout(this.timer); }

  async refresh(autoPoll = false) {
    const session = this.session();
    if (!session?.orderStatusUrl) {
      this.viewState.set('error');
      this.errorMessage.set('No existe una CheckoutSession válida para consultar este pedido.');
      return;
    }
    this.loading.set(true);
    if (this.viewState() !== 'pending') this.viewState.set('checking');
    try {
      const response = await firstValueFrom(this.http.get<OrderStatusResponse>(session.orderStatusUrl));
      const current = response?.data && typeof response.data === 'object' ? response.data : response;
      const normalized: OrderStatusPayload = {
        ...current,
        sale_id: current?.sale_id ?? session.saleId,
        total: current?.total ?? current?.total_amount ?? session.totals.total,
        reservation: current?.reservation ?? (current?.reservation_expires_at || session.reservationExpiresAt ? {
          state: 'active',
          expires_at: current?.reservation_expires_at ?? session.reservationExpiresAt ?? null,
        } : null),
      };
      this.statusDetail.set(normalized);

      const saleStatus = String(normalized.sale_status ?? normalized.status ?? '').toLowerCase();
      const paymentStatus = String(normalized.payment_status ?? '').toLowerCase();
      const reservationState = String(normalized.reservation?.state ?? '').toLowerCase();

      if (saleStatus === 'approved' && paymentStatus === 'paid') {
        this.viewState.set('approved');
        this.store.clearCart();
        this.sessions.clear();
        return;
      }
      if (
        ['expired', 'cancelled', 'canceled', 'failed'].includes(saleStatus) ||
        ['rejected', 'cancelled', 'canceled', 'failed'].includes(paymentStatus) ||
        ['expired', 'released', 'cancelled', 'canceled'].includes(reservationState)
      ) {
        this.viewState.set('terminal');
        return;
      }
      this.viewState.set('pending');
      if (autoPoll && this.isBrowser() && this.attempts < 10) {
        this.attempts++;
        this.timer = setTimeout(() => void this.refresh(true), 4000);
      }
    } catch (error) {
      this.viewState.set('error');
      this.errorMessage.set(getApiErrorMessage(error, 'No fue posible consultar el estado firmado del pedido.'));
    } finally { this.loading.set(false); }
  }

  async recoverCart() {
    const session = this.session();
    if (!session) return;
    this.loading.set(true);
    try {
      await this.store.restoreCartSnapshot(session.cartSnapshot);
      this.sessions.clear();
      this.toast.success('Recuperamos tu carrito y lo revalidamos con el catálogo actual.');
      await this.router.navigate(['/carrito']);
    } catch (error) {
      this.toast.error(error instanceof Error ? error.message : 'No fue posible recuperar el carrito.');
    } finally { this.loading.set(false); }
  }

  saleStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      approved: 'Aprobado',
      cancelled: 'Cancelado',
      canceled: 'Cancelado',
      failed: 'Fallido',
      expired: 'Expirado',
    };
    return labels[status.toLowerCase()] || status || 'Pendiente';
  }

  paymentStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'En validación',
      paid: 'Pagado',
      partial: 'Parcial',
      unpaid: 'Sin pago',
      rejected: 'Rechazado',
      cancelled: 'Cancelado',
      canceled: 'Cancelado',
      failed: 'Fallido',
    };
    return labels[status.toLowerCase()] || status || 'En validación';
  }

  reservationStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      active: 'Activa',
      reserved: 'Activa',
      released: 'Liberada',
      expired: 'Expirada',
      cancelled: 'Cancelada',
      canceled: 'Cancelada',
    };
    return labels[status.toLowerCase()] || status || 'Sin estado';
  }
}
