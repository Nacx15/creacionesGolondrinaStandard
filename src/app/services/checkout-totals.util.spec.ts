import {describe, expect, it} from 'vitest';
import {extractAuthoritativeTotals} from './checkout-totals.util';

describe('Totales autoritativos create-preference / create-whatsapp-order', () => {
  it('prefiere bloque totals firmado por backend sobre cifras en el nivel raíz', () => {
    expect(extractAuthoritativeTotals({totals: {subtotal: 2600, shipping_cost: 0, total: 2600}, subtotal: 1, shipping_cost: 999, total: 1000}))
      .toEqual({subtotal: 2600, shippingCost: 0, total: 2600});
  });
  it('admite respuesta legacy en el nivel raíz con tres importes explícitos', () => {
    expect(extractAuthoritativeTotals({subtotal: 2300, shipping_cost: 287, total_amount: 2587}))
      .toEqual({subtotal: 2300, shippingCost: 287, total: 2587});
  });
  it('no rellena con cero ni subtotal locales cuando el backend omite el envío', () => {
    expect(extractAuthoritativeTotals({subtotal: 2300, total: 2300})).toBeNull();
    expect(extractAuthoritativeTotals({totals: {subtotal: 2300, shipping_cost: null, total: 2300}})).toBeNull();
    expect(extractAuthoritativeTotals({subtotal: 2300, shipping_cost: -1, total: 2300})).toBeNull();
  });
});
