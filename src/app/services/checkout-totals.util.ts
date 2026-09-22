/** Solo extrae totales retornados por GuayaFlow; nunca usa precios ni envío del navegador como fallback. */
export interface AuthoritativeCheckoutTotals {
  subtotal: number;
  shippingCost: number;
  total: number;
}

function amount(value: unknown): number | null {
  if (value === null || value === undefined || typeof value === 'boolean') return null;
  if (typeof value !== 'number' && (typeof value !== 'string' || !value.trim())) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function extractAuthoritativeTotals(response: unknown): AuthoritativeCheckoutTotals | null {
  if (!response || typeof response !== 'object') return null;
  const root = response as Record<string, unknown>;
  const nested = root['totals'] && typeof root['totals'] === 'object'
    ? root['totals'] as Record<string, unknown>
    : {};
  const subtotal = amount(nested['subtotal'] ?? root['subtotal']);
  const shippingCost = amount(nested['shipping_cost'] ?? root['shipping_cost']);
  const total = amount(nested['total'] ?? root['total'] ?? root['total_amount']);
  if (subtotal === null || shippingCost === null || total === null) return null;
  return {subtotal, shippingCost, total};
}
