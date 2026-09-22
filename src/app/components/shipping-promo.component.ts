import {ChangeDetectionStrategy, Component, computed, inject} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {Store} from './store';
import {EcommerceStatusService} from '../services/ecommerce-status.service';

/** Un solo mensaje reactivo para Inicio, Catálogo, Detalle y Checkout. Sin HTTP ni browser globals. */
@Component({
  selector: 'app-shipping-promo',
  standalone: true,
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside class="rounded-2xl border border-brand-pink/15 bg-brand-cream p-4 md:p-5" aria-live="polite">
      <div class="flex items-start gap-3">
        <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-light-pink text-brand-pink">
          <mat-icon>local_shipping</mat-icon>
        </span>
        <div class="min-w-0 flex-1">
          <h3 class="font-serif-brand font-bold text-gray-900 text-lg">{{ title() }}</h3>
          <p class="text-sm leading-relaxed text-gray-600 mt-1">{{ description() }}</p>
          @if (showProgress()) {
            <div class="mt-3" role="progressbar" aria-label="Progreso hacia el envío gratis"
              aria-valuemin="0" aria-valuemax="100" [attr.aria-valuenow]="roundProgress()">
              <div class="h-2 w-full rounded-full overflow-hidden bg-brand-pink/10">
                <div class="h-full rounded-full bg-brand-pink transition-all duration-300"
                  [style.width.%]="roundProgress()"></div>
              </div>
              <p class="text-xs text-brand-pink font-semibold mt-1">{{ roundProgress() }}% del requisito</p>
            </div>
          }
          <p class="text-[11px] text-gray-500 mt-3">El envío es estimado; GuayaFlow confirma el costo y total final al registrar el pedido.</p>
        </div>
      </div>
    </aside>
  `,
})
export class ShippingPromoComponent {
  private readonly status = inject(EcommerceStatusService);
  private readonly store = inject(Store);
  readonly configuration = this.status.shipping;
  readonly estimate = computed(() => this.status.estimateShipping(this.store.cartTotalItems(), this.store.cartTotalPrice()));
  // Evita desreferenciar la configuracion opcional directamente en el template Angular.
  readonly showProgress = computed(() => {
    const config = this.configuration();
    return config !== null && config.freeShipping.enabled && this.estimate() !== null;
  });
  readonly roundProgress = computed(() => {
    const current = this.estimate();
    return current?.freeShippingApplied ? 100 : Math.floor((current?.progress ?? 0) * 100);
  });
  private readonly money = new Intl.NumberFormat('es-MX', {style: 'currency', currency: 'MXN'});

  readonly title = computed(() => {
    const config = this.configuration();
    const result = this.estimate();
    if (!config || !result) return 'Envío por calcular';
    if (!config.freeShipping.enabled) return 'Envío disponible';
    if (result.freeShippingApplied) return '¡Tu carrito cumple la promoción de envío gratis!';
    const {condition, minItems, minAmount} = config.freeShipping;
    const itemText = `${minItems} ${minItems === 1 ? 'prenda' : 'prendas'}`;
    switch (condition) {
      case 'items': return `Envío gratis desde ${itemText}`;
      case 'amount': return `Envío gratis desde ${this.money.format(minAmount)}`;
      case 'items_or_amount': return `Envío gratis con ${itemText} o ${this.money.format(minAmount)}`;
      case 'items_and_amount': return `Envío gratis con ${itemText} y ${this.money.format(minAmount)}`;
    }
    return 'Envío por calcular';
  });

  readonly description = computed(() => {
    const config = this.configuration();
    const result = this.estimate();
    if (!config || !result) return 'Consultando la configuración de envío de la tienda. No se presupone envío sin costo.';
    if (!config.freeShipping.enabled) return `Tarifa estándar estimada: ${this.money.format(config.flatRate)}.`;
    if (result.freeShippingApplied) return 'Al registrar tu pedido, el servidor recalculará el envío con precios y existencias vigentes.';
    const missingItems = `${result.itemsMissing} ${result.itemsMissing === 1 ? 'prenda' : 'prendas'}`;
    const missingAmount = this.money.format(result.amountMissing);
    switch (config.freeShipping.condition) {
      case 'items': return `Agrega ${missingItems} más para alcanzar la promoción.`;
      case 'amount': return `Agrega ${missingAmount} más a tu carrito para alcanzar la promoción.`;
      case 'items_or_amount': return `Agrega ${missingItems} o ${missingAmount} más para alcanzar la promoción.`;
      case 'items_and_amount': {
        const pending = [
          !result.itemsMet ? `${missingItems} más` : null,
          !result.amountMet ? `${missingAmount} más en compra` : null,
        ].filter((part): part is string => part !== null);
        return `Para obtener el envío gratis necesitas ${pending.join(' y ')}.`;
      }
    }
    return 'Regla de envío por calcular.';
  });
}
