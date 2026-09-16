import {HttpErrorResponse} from '@angular/common/http';

export function getApiErrorMessage(error: unknown, fallback = 'Ocurrió un error al procesar la solicitud.'): string {
  if (!(error instanceof HttpErrorResponse)) return fallback;

  const body = error.error as any;
  const formatted = body?.message || body?.error?.message || body?.errors?.message;
  if (typeof formatted === 'string' && formatted.trim()) return formatted.trim();

  if (body?.errors && typeof body.errors === 'object') {
    const first = Object.values(body.errors).flat().find((value) => typeof value === 'string');
    if (typeof first === 'string') return first;
  }

  switch (error.status) {
    case 0: return 'No fue posible conectar con GuayaFlow. Verifica tu conexión e inténtalo de nuevo.';
    case 403: return 'La tienda no está disponible en este momento.';
    case 409:
      if (body?.code === 'insufficient_stock') return 'La disponibilidad cambió. Actualiza el carrito antes de continuar.';
      if (body?.code === 'ecommerce_price_unavailable') return 'El precio de esta variante ya no está disponible para compra en línea.';
      if (body?.code === 'mercadopago_not_available') return 'Mercado Pago no está disponible en este momento. Puedes intentar más tarde o usar WhatsApp.';
      return 'El carrito cambió por disponibilidad o precio. Revisa los ajustes antes de continuar.';
    case 422: return 'Revisa los datos capturados e intenta nuevamente.';
    case 503: return 'La tienda está temporalmente en mantenimiento o su configuración no está disponible.';
    case 500: return 'GuayaFlow no pudo completar la operación. Inténtalo nuevamente.';
    default: return fallback;
  }
}
