import {ChangeDetectionStrategy, Component, OnInit, PLATFORM_ID, computed, inject, signal} from '@angular/core';
import {CommonModule, isPlatformBrowser} from '@angular/common';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Router, RouterLink} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {firstValueFrom} from 'rxjs';
import {Store, CartItem} from '../components/store';
import {Seo} from '../components/seo';
import {environment} from '../../environments/environment';
import {CheckoutSessionService} from '../services/checkout-session.service';
import {ToastService} from '../services/toast.service';
import {getApiErrorMessage} from '../shared/http/api-error.util';

interface ApiCheckoutResponse {
  success?: boolean;
  sale_id?: number | string;
  preference_id?: string;
  init_point?: string;
  order_status_url?: string;
  orderStatusUrl?: string;
  signed_status_url?: string;
  reservation_expires_at?: string;
  reservationExpiresAt?: string;
  subtotal?: number;
  shipping_cost?: number;
  total?: number;
  total_amount?: number;
  totals?: {subtotal?: number; shipping_cost?: number; total?: number};
  message?: string;
}

const PC_MAP: Record<string, {city: string; state: string; country: string}> = {
  '97680': {city: 'Tekit', state: 'Yucatán', country: 'México'},
  '97000': {city: 'Mérida', state: 'Yucatán', country: 'México'},
  '97100': {city: 'Mérida', state: 'Yucatán', country: 'México'},
  '97300': {city: 'Progreso', state: 'Yucatán', country: 'México'},
  '97780': {city: 'Valladolid', state: 'Yucatán', country: 'México'},
  '01000': {city: 'Álvaro Obregón', state: 'Ciudad de México', country: 'México'},
  '06000': {city: 'Cuauhtémoc', state: 'Ciudad de México', country: 'México'},
  '50000': {city: 'Toluca', state: 'Estado de México', country: 'México'},
  '64000': {city: 'Monterrey', state: 'Nuevo León', country: 'México'},
  '44100': {city: 'Guadalajara', state: 'Jalisco', country: 'México'},
  '77500': {city: 'Cancún', state: 'Quintana Roo', country: 'México'},
};

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="py-12 bg-brand-cream animate-fade-in relative">
      @if (isProcessing()) {
        <div class="fixed inset-0 bg-brand-dark/90 backdrop-blur-md z-50 flex flex-col items-center justify-center text-center px-4">
          <div class="relative w-24 h-24 mb-6">
            <div class="absolute inset-0 rounded-full border-4 border-white/20"></div>
            <div class="absolute inset-0 rounded-full border-4 border-brand-pink border-t-transparent animate-spin"></div>
            <mat-icon class="absolute inset-0 m-auto text-white text-3xl h-8 w-8">lock</mat-icon>
          </div>
          <h2 class="font-serif-brand text-2xl md:text-3xl font-bold text-white mb-2">Preparando tu pago seguro</h2>
          <p class="text-gray-300 text-sm max-w-md">Estamos revalidando existencias y solicitando a GuayaFlow los totales autoritativos antes de enviarte a Mercado Pago.</p>
        </div>
      }

      <div class="container mx-auto px-4">
        <div class="text-center max-w-xl mx-auto mb-10">
          <h1 class="font-serif-brand text-4xl font-bold text-gray-900">Finalizar Compra</h1>
          <div class="w-12 h-1 bg-brand-pink mx-auto mt-2 rounded-full mb-4"></div>
          <p class="text-gray-500 text-sm">Tu cobro se completa en Mercado Pago. Creaciones Golondrina no solicita datos de tarjeta en este sitio.</p>
        </div>

        @if (store.cart().length === 0) {
          <div class="max-w-2xl mx-auto bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center">
            <mat-icon class="text-brand-pink text-5xl h-12 w-12 mx-auto mb-4">shopping_cart</mat-icon>
            <h2 class="font-serif-brand text-2xl font-bold mb-2">Tu carrito está vacío</h2>
            <p class="text-gray-500 mb-6">Agrega una prenda disponible antes de iniciar el pago.</p>
            <a routerLink="/catalogo" class="inline-flex bg-brand-pink text-white rounded-full px-7 py-3 font-semibold">Ir al catálogo</a>
          </div>
        } @else {
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto">
            <div class="lg:col-span-7 space-y-6">
              <div class="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm">
                <h3 class="font-serif-brand text-xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100 flex items-center gap-2">
                  <mat-icon class="text-brand-pink">local_shipping</mat-icon> 1. Datos de envío
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm">
                  <div><label class="field-label" for="first-name">Nombre *</label><input id="first-name" class="field" [value]="firstName()" (input)="firstName.set($any($event.target).value)" autocomplete="given-name"></div>
                  <div><label class="field-label" for="last-name">Apellidos *</label><input id="last-name" class="field" [value]="lastName()" (input)="lastName.set($any($event.target).value)" autocomplete="family-name"></div>
                  <div><label class="field-label" for="ship-email">Correo electrónico {{ payMethod() === 'MercadoPago' ? '*' : '(opcional)' }}</label><input id="ship-email" type="email" class="field" [value]="email()" (input)="email.set($any($event.target).value)" autocomplete="email"></div>
                  <div><label class="field-label" for="ship-phone">Teléfono *</label><input id="ship-phone" type="tel" class="field" [value]="phone()" (input)="phone.set($any($event.target).value)" autocomplete="tel"></div>
                  <div class="md:col-span-2"><label class="field-label" for="street">Dirección *</label><input id="street" class="field" [value]="street()" (input)="street.set($any($event.target).value)" autocomplete="street-address"></div>
                  <div class="md:col-span-2"><label class="field-label" for="reference">Referencia del domicilio</label><input id="reference" class="field" [value]="reference()" (input)="reference.set($any($event.target).value)" placeholder="Ej. Entre calles, color de fachada o punto de referencia"></div>
                  <div><label class="field-label" for="postal">Código postal *</label><input id="postal" maxlength="5" class="field font-mono" [value]="postalCode()" (input)="onPostalCodeInput($any($event.target).value)" autocomplete="postal-code"></div>
                  <div><label class="field-label" for="city">Ciudad / Municipio *</label><input id="city" class="field" [value]="city()" (input)="city.set($any($event.target).value)" autocomplete="address-level2"></div>
                  <div><label class="field-label" for="state">Estado *</label><input id="state" class="field" [value]="state()" (input)="state.set($any($event.target).value)" autocomplete="address-level1"></div>
                  <div><label class="field-label" for="country">País *</label><input id="country" class="field" [value]="country()" (input)="country.set($any($event.target).value)" autocomplete="country-name"></div>
                </div>
              </div>

              <div class="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm">
                <h3 class="font-serif-brand text-xl font-bold text-gray-900 mb-5 pb-2 border-b border-gray-100 flex items-center gap-2"><mat-icon class="text-brand-pink">payment</mat-icon> 2. Pago</h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                  <button type="button" (click)="payMethod.set('MercadoPago')" [ngClass]="payMethod() === 'MercadoPago' ? 'border-brand-pink bg-brand-light-pink text-brand-pink' : 'border-gray-200 bg-white text-gray-600'" class="p-4 border rounded-xl flex items-center justify-center gap-2 font-semibold transition-all">
                    <mat-icon>verified_user</mat-icon><span>Mercado Pago</span>
                  </button>
                  <button type="button" (click)="payMethod.set('WhatsApp')" [ngClass]="payMethod() === 'WhatsApp' ? 'border-[#25D366] bg-emerald-50 text-emerald-700' : 'border-gray-200 bg-white text-gray-600'" class="p-4 border rounded-xl flex items-center justify-center gap-2 font-semibold transition-all">
                    <mat-icon>chat</mat-icon><span>WhatsApp</span>
                  </button>
                </div>
                @if (payMethod() === 'MercadoPago') {
                  <div class="bg-brand-cream border border-brand-pink/10 p-6 rounded-2xl flex gap-4 items-start">
                    <mat-icon class="text-brand-pink">verified_user</mat-icon>
                    <div><h4 class="font-bold text-gray-900">Mercado Pago</h4><p class="text-sm text-gray-600 mt-1 leading-relaxed">GuayaFlow reservará inventario y recalculará precio, envío y total. Después serás redirigido en esta misma pestaña a Mercado Pago.</p></div>
                  </div>
                } @else {
                  <div class="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl flex gap-4 items-start">
                    <mat-icon class="text-emerald-600">chat</mat-icon>
                    <div><h4 class="font-bold text-emerald-900">Pedido por WhatsApp</h4><p class="text-sm text-emerald-800 mt-1 leading-relaxed">Primero registraremos el pedido en GuayaFlow con la variante, precio y stock vigentes. Solo si el backend lo acepta abriremos el chat para coordinar el pago y envío.</p></div>
                  </div>
                }
              </div>
            </div>

            <div class="lg:col-span-5 bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm self-start">
              <h3 class="font-serif-brand text-xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">Tu Pedido</h3>
              <div class="divide-y divide-gray-50 mb-6 max-h-64 overflow-y-auto pr-2">
                @for (item of store.cart(); track item.variantId) {
                  <div class="py-3 flex justify-between gap-4 text-xs md:text-sm">
                    <div><span class="font-bold text-gray-800">{{ item.product.name }}</span><p class="text-gray-400">Talla: {{ item.selectedSize }} | Color: {{ item.selectedColor }} | Cant: {{ item.quantity }}</p></div>
                    <span class="font-semibold text-gray-900 whitespace-nowrap">{{ '$' + (item.unitPrice * item.quantity) }} MXN</span>
                  </div>
                }
              </div>
              <div class="space-y-3 pt-4 border-t border-gray-100 mb-6 text-xs md:text-sm">
                <div class="flex justify-between text-gray-500"><span>Productos ({{ store.cartTotalItems() }} piezas)</span><span class="font-semibold text-gray-900">{{ '$' + store.cartTotalPrice() }} MXN</span></div>
                <div class="flex justify-between text-gray-500"><span>Envío</span><span class="text-gray-700">Se valida en GuayaFlow</span></div>
                <div class="flex justify-between text-base font-bold text-gray-900 pt-3 border-t border-gray-100"><span>Total preliminar</span><span class="text-brand-pink text-lg">{{ '$' + store.cartTotalPrice() }} MXN</span></div>
              </div>
              @if (validationError()) {<div class="bg-rose-50 text-rose-700 text-xs p-3 rounded-xl mb-4 font-semibold flex gap-2 border border-rose-100"><mat-icon class="text-sm">error_outline</mat-icon>{{ validationError() }}</div>}
              <button (click)="submitPayment()" [disabled]="isProcessing()" [ngClass]="payMethod() === 'WhatsApp' ? 'bg-[#25D366] hover:bg-[#128C7E]' : 'bg-brand-pink hover:bg-brand-dark'" class="w-full text-white font-bold rounded-xl h-14 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50">
                <mat-icon>{{ payMethod() === 'WhatsApp' ? 'chat' : 'security' }}</mat-icon>
                {{ payMethod() === 'WhatsApp' ? 'Registrar y continuar por WhatsApp' : 'Continuar a Mercado Pago' }}
              </button>
              <div class="flex items-center justify-center gap-1.5 mt-4 text-[10px] text-gray-400"><mat-icon class="text-sm h-4 w-4">shield</mat-icon> El backend valida variante, stock y precio antes de continuar</div>
            </div>
          </div>
        }
      </div>
    </section>
  `,
  styles: `
    .field-label { display:block; font-size:.75rem; font-weight:700; color:#6b7280; text-transform:uppercase; letter-spacing:.05em; margin-bottom:.375rem; }
    .field { width:100%; padding:.625rem 1rem; background:var(--color-brand-cream, #fffaf7); border:1px solid transparent; border-radius:.75rem; outline:none; }
    .field:focus { border-color: color-mix(in srgb, var(--color-brand-pink, #c65b7c) 30%, transparent); }
    .animate-fade-in { animation: fadeIn .4s ease-out forwards; }
    @keyframes fadeIn { from {opacity:0; transform:translateY(8px)} to {opacity:1; transform:translateY(0)} }
  `,
})
export class Checkout implements OnInit {
  readonly store = inject(Store);
  private readonly http = inject(HttpClient);
  private readonly seo = inject(Seo);
  private readonly checkoutSession = inject(CheckoutSessionService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  readonly firstName = signal('');
  readonly lastName = signal('');
  readonly email = signal('');
  readonly phone = signal('');
  readonly street = signal('');
  readonly reference = signal('');
  readonly city = signal('');
  readonly state = signal('');
  readonly postalCode = signal('');
  readonly country = signal('México');
  readonly payMethod = signal<'MercadoPago' | 'WhatsApp'>('MercadoPago');
  readonly isProcessing = signal(false);
  readonly validationError = signal('');
  readonly fullName = computed(() => `${this.firstName().trim()} ${this.lastName().trim()}`.trim());

  constructor() {
    this.seo.setMetaTags('Finalizar Compra', 'Completa tus datos de envío y continúa a Mercado Pago de forma segura.', ['checkout Creaciones Golondrina', 'Mercado Pago']);
  }

  ngOnInit(): void {
    // Checkout is a strong commercial checkpoint. It must obtain an inventory/price
    // snapshot that starts at/after entering checkout, rather than reusing a request
    // that may have begun on Cart/Detail immediately before navigation.
    void this.store.refreshCatalogAndCart(true, true, true);
  }

  onPostalCodeInput(value: string) {
    const clean = value.replace(/\D/g, '').slice(0, 5);
    this.postalCode.set(clean);
    const mapped = PC_MAP[clean];
    if (mapped) { this.city.set(mapped.city); this.state.set(mapped.state); this.country.set(mapped.country); }
  }

  getItemPrice(item: CartItem) { return item.unitPrice; }

  private validateForm(): string | null {
    if (!this.firstName().trim()) return 'Ingresa tu nombre.';
    if (!this.lastName().trim()) return 'Ingresa tus apellidos.';
    const email = this.email().trim();
    if (this.payMethod() === 'MercadoPago' && (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
      return 'Ingresa un correo electrónico real y válido para Mercado Pago.';
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Revisa el formato del correo electrónico.';
    if (this.phone().replace(/\D/g, '').length < 10) return 'Ingresa un teléfono válido.';
    if (!this.street().trim()) return 'Ingresa la dirección de entrega.';
    if (!this.city().trim()) return 'Ingresa la ciudad o municipio.';
    if (!this.state().trim()) return 'Ingresa el estado de la dirección.';
    if (!/^\d{5}$/.test(this.postalCode())) return 'Ingresa un código postal de 5 dígitos.';
    if (!this.country().trim()) return 'Ingresa el país.';
    return null;
  }

  private normalizeOrderStatusUrl(url: string): string {
    const value = String(url || '').trim();
    if (!value) return '';
    if (/^https?:\/\//i.test(value)) return value;
    const apiOrigin = environment.apiUrl.replace(/\/api\/?$/, '');
    if (value.startsWith('/')) return `${apiOrigin}${value}`;
    return `${environment.apiUrl.replace(/\/$/, '')}/${value}`;
  }

  private buildWhatsappUrl(saleId: string, total: number, items: CartItem[]): string {
    const itemLines = items.map((item) => `- ${item.product.name} | Talla ${item.selectedSize} | Color ${item.selectedColor} | Cant. ${item.quantity}`).join('\n');
    const text = encodeURIComponent(
      `Hola Creaciones Golondrina, mi pedido #${saleId} ya fue registrado en GuayaFlow.\n\n` +
      `Cliente: ${this.fullName()}\nTeléfono: ${this.phone().trim()}\n` +
      `${this.email().trim() ? `Correo: ${this.email().trim()}\n` : ''}` +
      `Dirección: ${this.street().trim()}, ${this.city().trim()}, ${this.state().trim()}, CP ${this.postalCode()}\n` +
      `${this.reference().trim() ? `Referencia: ${this.reference().trim()}\n` : ''}\n` +
      `Prendas:\n${itemLines}\n\nTotal registrado: $${total} MXN\n\nDeseo coordinar el pago y envío.`
    );
    return `https://wa.me/${environment.whatsappNumber}?text=${text}`;
  }

  private async handleCheckoutError(error: unknown): Promise<void> {
    if (error instanceof HttpErrorResponse) {
      const body = error.error as any;
      const code = String(body?.code ?? body?.error?.code ?? '').toLowerCase();

      if (error.status === 409 && code === 'insufficient_stock') {
        // A backend 409 is authoritative. Fetch a brand-new snapshot before showing
        // the corrected availability to the customer.
        await this.store.refreshCatalogAndCart(false, true, true);
        const available = Number(body?.available ?? body?.data?.available);
        const productName = String(body?.product_name ?? body?.data?.product_name ?? '').trim();
        const message = Number.isFinite(available) && available > 0
          ? `${productName ? `${productName}: ` : ''}solo quedan ${available} unidad(es) disponibles.`
          : `${productName ? `${productName}: ` : ''}la variante solicitada ya no tiene existencias disponibles.`;
        this.validationError.set(message);
        this.toast.warning(message);
        return;
      }

      if (error.status === 409 && code === 'ecommerce_price_unavailable') {
        await this.store.refreshCatalogAndCart(false, true, true);
        const productName = String(body?.product_name ?? body?.data?.product_name ?? '').trim();
        const message = productName
          ? `${productName} requiere consultar el precio por WhatsApp y se retiró o actualizó en tu carrito.`
          : 'Uno de los productos ya no tiene precio disponible para compra en línea. Actualizamos tu carrito.';
        this.validationError.set(message);
        this.toast.info(message);
        return;
      }

      if (error.status === 409 && code === 'mercadopago_not_available') {
        const message = 'Mercado Pago no está disponible en este momento. Puedes intentar más tarde o registrar el pedido por WhatsApp.';
        this.validationError.set(message);
        this.toast.warning(message);
        return;
      }
    }

    const message = getApiErrorMessage(error, 'No fue posible iniciar el pago.');
    this.validationError.set(message);
    this.toast.error(message);
  }

  async submitPayment() {
    this.validationError.set('');
    const validation = this.validateForm();
    if (validation) { this.validationError.set(validation); return; }
    if (!this.store.cart().length) { await this.router.navigate(['/carrito']); return; }

    this.isProcessing.set(true);
    try {
      // Both Mercado Pago and WhatsApp pass through this same submit path.
      // Require a snapshot initiated from this exact action before any order is created.
      const unchanged = await this.store.revalidateCart(true, true, false, true);
      if (!this.store.cart().length) {
        this.validationError.set('Las variantes de tu carrito ya no están disponibles.');
        return;
      }
      if (!unchanged) {
        this.validationError.set('Actualizamos tu carrito con existencias y precios vigentes. Revísalo y vuelve a continuar cuando estés de acuerdo.');
        return;
      }

      const payload = {
        type: 'Venta Directa',
        paymentMethod: this.payMethod() === 'WhatsApp' ? 'whatsapp' : 'mercadopago',
        // Estos totales son informativos. Laravel los recalcula y es la única autoridad.
        subtotal: this.store.cartTotalPrice(),
        shipping_cost: 0,
        total_amount: this.store.cartTotalPrice(),
        items: this.store.cart().map((item) => ({
          id: item.variantId,
          modelName: `${item.product.name} color ${item.selectedColor} talla ${item.selectedSize}`,
          price: item.unitPrice,
          cartQty: item.quantity,
          color: item.selectedColor,
          size: item.selectedSize,
        })),
        shipping_address: {
          customer_name: this.fullName(),
          first_name: this.firstName().trim(),
          last_name: this.lastName().trim(),
          phone: this.phone().trim(),
          email: this.email().trim() || null,
          address_line_1: this.street().trim(),
          address_line_2: this.reference().trim(),
          reference: this.reference().trim(),
          city: this.city().trim(),
          state: this.state().trim(),
          postal_code: this.postalCode(),
          country: /^méxico$/i.test(this.country().trim()) || /^mexico$/i.test(this.country().trim()) ? 'MX' : this.country().trim(),
        },
      };

      const isWhatsapp = this.payMethod() === 'WhatsApp';
      const endpoint = isWhatsapp ? `${environment.apiUrl}/payment/create-whatsapp-order` : `${environment.apiUrl}/payment/create-preference`;
      const response = await firstValueFrom(this.http.post<ApiCheckoutResponse>(endpoint, payload));
      if (response?.success === false || !response.sale_id) throw new Error(response?.message || 'GuayaFlow no pudo registrar el pedido.');
      const subtotal = Number(response.totals?.subtotal ?? response.subtotal ?? this.store.cartTotalPrice());
      const shippingCost = Number(response.totals?.shipping_cost ?? response.shipping_cost ?? 0);
      const total = Number(response.totals?.total ?? response.total ?? response.total_amount ?? subtotal + shippingCost);

      if (isWhatsapp) {
        const snapshot = [...this.store.cart()];
        const saleId = String(response.sale_id);
        const whatsappUrl = this.buildWhatsappUrl(saleId, total, snapshot);
        this.store.clearCart();
        this.toast.success(`Pedido #${saleId} registrado en GuayaFlow.`);
        if (isPlatformBrowser(this.platformId)) window.location.assign(whatsappUrl);
        return;
      }

      if (!response.init_point) throw new Error('GuayaFlow no devolvió el init_point de Mercado Pago.');
      const orderStatusUrl = this.normalizeOrderStatusUrl(response.order_status_url || response.orderStatusUrl || response.signed_status_url || '');
      if (!orderStatusUrl) throw new Error('GuayaFlow no devolvió la URL firmada para consultar el estado del pedido.');
      this.checkoutSession.save({
        saleId: String(response.sale_id),
        preferenceId: response.preference_id || '',
        initPoint: response.init_point,
        orderStatusUrl,
        reservationExpiresAt: response.reservation_expires_at || response.reservationExpiresAt || null,
        totals: {subtotal, shippingCost, total},
        cartSnapshot: this.store.cart().map((item) => ({...item, product: {...item.product, variantes: [...item.product.variantes]}})),
        createdAt: new Date().toISOString(),
      });

      if (!isPlatformBrowser(this.platformId)) return;
      window.location.assign(response.init_point);
    } catch (error) {
      if (error instanceof Error && !(error instanceof HttpErrorResponse)) {
        this.validationError.set(error.message);
        this.toast.error(error.message);
      } else {
        await this.handleCheckoutError(error);
      }
    } finally {
      this.isProcessing.set(false);
    }
  }
}
