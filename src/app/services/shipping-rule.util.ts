/** Reglas UX espejo del contrato GuayaFlow. Laravel siempre recalcula el pedido. */
export type FreeShippingCondition = 'items' | 'amount' | 'items_or_amount' | 'items_and_amount';

export interface EcommerceFreeShippingConfiguration {
  enabled: boolean;
  condition: FreeShippingCondition;
  minItems: number;
  minAmount: number;
}

export interface EcommerceShippingConfiguration {
  flatRate: number;
  freeShipping: EcommerceFreeShippingConfiguration;
}

export interface ShippingEstimate {
  shippingCost: number;
  freeShippingApplied: boolean;
  itemsMet: boolean;
  amountMet: boolean;
  itemsMissing: number;
  amountMissing: number;
  itemsProgress: number;
  amountProgress: number;
  progress: number;
}

const CONDITIONS: readonly FreeShippingCondition[] = ['items', 'amount', 'items_or_amount', 'items_and_amount'];

function nonNegativeNumber(value: unknown): number | null {
  if (value === null || value === undefined || typeof value === 'boolean') return null;
  if (typeof value !== 'number' && (typeof value !== 'string' || !value.trim())) return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

/** No se aplican fallbacks comerciales: un contrato incompleto se muestra "Por calcular". */
export function parseShippingConfiguration(raw: unknown): EcommerceShippingConfiguration | null {
  if (!raw || typeof raw !== 'object') return null;
  const shipping = raw as Record<string, unknown>;
  const flatRate = nonNegativeNumber(shipping['flat_rate']);
  const free = shipping['free_shipping'];
  if (flatRate === null || !free || typeof free !== 'object') return null;
  const config = free as Record<string, unknown>;
  const enabled = config['enabled'];
  const condition = config['condition'];
  const minItems = nonNegativeNumber(config['min_items']);
  const minAmount = nonNegativeNumber(config['min_amount']);
  if (
    typeof enabled !== 'boolean' ||
    !CONDITIONS.includes(condition as FreeShippingCondition) ||
    minItems === null || !Number.isInteger(minItems) ||
    minAmount === null
  ) return null;

  return {
    flatRate,
    freeShipping: {enabled, condition: condition as FreeShippingCondition, minItems, minAmount},
  };
}

const progress = (value: number, target: number): number => target <= 0 ? 1 : Math.min(1, value / target);

export function estimateShipping(
  shipping: EcommerceShippingConfiguration | null,
  itemCount: number,
  subtotal: number,
): ShippingEstimate | null {
  if (!shipping) return null;
  const items = Number.isFinite(itemCount) ? Math.max(0, Math.floor(itemCount)) : 0;
  const amount = Number.isFinite(subtotal) ? Math.max(0, subtotal) : 0;
  const rule = shipping.freeShipping;
  const itemsMet = items >= rule.minItems;
  const amountMet = amount >= rule.minAmount;
  const itemsProgress = progress(items, rule.minItems);
  const amountProgress = progress(amount, rule.minAmount);

  let qualifies = false;
  let overallProgress = 0;
  if (rule.enabled) {
    switch (rule.condition) {
      case 'items': qualifies = itemsMet; overallProgress = itemsProgress; break;
      case 'amount': qualifies = amountMet; overallProgress = amountProgress; break;
      case 'items_or_amount': qualifies = itemsMet || amountMet; overallProgress = Math.max(itemsProgress, amountProgress); break;
      case 'items_and_amount': qualifies = itemsMet && amountMet; overallProgress = Math.min(itemsProgress, amountProgress); break;
    }
  }

  return {
    shippingCost: qualifies ? 0 : shipping.flatRate,
    freeShippingApplied: qualifies,
    itemsMet,
    amountMet,
    itemsMissing: Math.max(0, rule.minItems - items),
    amountMissing: Math.max(0, rule.minAmount - amount),
    itemsProgress,
    amountProgress,
    progress: overallProgress,
  };
}
