import {describe, expect, it} from 'vitest';
import {estimateShipping, parseShippingConfiguration} from './shipping-rule.util';

const config = (condition: 'items' | 'amount' | 'items_or_amount' | 'items_and_amount', enabled = true) =>
  parseShippingConfiguration({flat_rate: 287, free_shipping: {enabled, condition, min_items: 3, min_amount: 2500}});

describe('Contrato de envío GuayaFlow', () => {
  it('sin configuración no presupone envío gratis ni tarifa', () => {
    expect(parseShippingConfiguration(null)).toBeNull();
    expect(estimateShipping(null, 3, 2500)).toBeNull();
    expect(parseShippingConfiguration({flat_rate: 0})).toBeNull();
    expect(parseShippingConfiguration({flat_rate: 'x', free_shipping: {enabled: true, condition: 'items', min_items: 3, min_amount: 2500}})).toBeNull();
    expect(parseShippingConfiguration({flat_rate: 300, free_shipping: {enabled: true, condition: 'otro', min_items: 3, min_amount: 2500}})).toBeNull();
  });

  it('enabled=false nunca promociona envío gratis, incluso con ambos umbrales cumplidos', () => {
    const shipping = estimateShipping(config('items_and_amount', false), 10, 10000);
    expect(shipping?.freeShippingApplied).toBe(false);
    expect(shipping?.shippingCost).toBe(287);
    expect(shipping?.progress).toBe(0);
  });

  it('items usa cantidad de prendas (suma de cartQty)', () => {
    expect(estimateShipping(config('items'), 2, 10000)?.shippingCost).toBe(287);
    expect(estimateShipping(config('items'), 3, 0)?.shippingCost).toBe(0);
    expect(estimateShipping(config('items'), 2, 200)?.itemsMissing).toBe(1);
  });

  it('varias unidades de la misma variante suman prendas y no modelos únicos', () => {
    const cart = [{variantId: 42, quantity: 3, unitPrice: 250}];
    const itemCount = cart.reduce((sum, line) => sum + line.quantity, 0);
    const subtotal = cart.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
    expect(itemCount).toBe(3);
    expect(estimateShipping(config('items'), itemCount, subtotal)?.shippingCost).toBe(0);
  });

  it('amount aplica al subtotal ecommerce', () => {
    expect(estimateShipping(config('amount'), 50, 2499)?.amountMissing).toBe(1);
    expect(estimateShipping(config('amount'), 50, 2499)?.shippingCost).toBe(287);
    expect(estimateShipping(config('amount'), 1, 2500)?.shippingCost).toBe(0);
  });

  it('OR concede con cualquiera y muestra el camino más avanzado', () => {
    expect(estimateShipping(config('items_or_amount'), 3, 100)?.shippingCost).toBe(0);
    expect(estimateShipping(config('items_or_amount'), 1, 2500)?.shippingCost).toBe(0);
    expect(estimateShipping(config('items_or_amount'), 1, 2000)?.shippingCost).toBe(287);
    expect(estimateShipping(config('items_or_amount'), 1, 2000)?.progress).toBe(0.8);
  });

  it('AND requiere ambos y progresa según el requisito menor', () => {
    expect(estimateShipping(config('items_and_amount'), 3, 2499)?.shippingCost).toBe(287);
    expect(estimateShipping(config('items_and_amount'), 2, 2500)?.shippingCost).toBe(287);
    expect(estimateShipping(config('items_and_amount'), 3, 2500)?.shippingCost).toBe(0);
    expect(estimateShipping(config('items_and_amount'), 2, 2500)?.progress).toBeCloseTo(2 / 3);
  });

  it('tarifa cero real no se confunde con configuración ausente', () => {
    const raw = {flat_rate: 0, free_shipping: {enabled: false, condition: 'items', min_items: 3, min_amount: 2500}};
    expect(estimateShipping(parseShippingConfiguration(raw), 0, 0)?.shippingCost).toBe(0);
  });
});
