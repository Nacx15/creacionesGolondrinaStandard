# Creaciones Golondrina — Homologación GuayaFlow E-commerce Standard v1.0

Versión del estándar frontend: `1.0.0`

> Estado de certificación: **NO CERTIFICADO**. La implementación frontend quedó alineada por inspección estática, pero el checklist E2E completo requiere backend GuayaFlow operativo, Mercado Pago, webhook y pruebas de reservas/inventario.

## Matriz de auditoría

| Regla | Estado inicial | Cambio | Validación | Resultado |
|---|---|---|---|---|
| `X-Tenant` configurable | Parcial: ya existía interceptor y environment | Se limita a peticiones del API GuayaFlow y conserva `tenant` en `environment*` | Inspección estática del interceptor | Implementado; pendiente E2E de cabecera real |
| active / maintenance / inactive | Primera homologación: guardaba el estado y solo cambiaba al recargar/navegar | Revalidación forzada en cada navegación + monitor runtime cada 10 s + refresh al recuperar foco/visibilidad + `errorInterceptor` para `403/503` autoritativos + mensaje backend | Inspección estática; 16/16 checks de cierre | Implementado; repetir E2E active ↔ maintenance ↔ inactive |
| payment routes durante mantenimiento | No existían | `/payment/success`, `/payment/pending`, `/payment/failure` quedan sin guard de tienda | Inspección de rutas | Implementado |
| catálogo real sin fallback mock | Incumplido: `Store` iniciaba con mocks y conservaba mocks al fallar API | `products=[]`, error explícito y sin inventario/precio ficticio | Búsqueda estática de fallback/mock | Implementado |
| `availableBodega` | Incumplido: UI usaba `qtyBodega` | Prefiere `availableBodega/available_bodega` autoritativo del backend; fallback compatible `max(0, qtyBodega - qtyApartado)` | Inspección de `mapVariant()` | Implementado |
| `ecommerce_price` | Incumplido: podía caer a `precio_publico` | Precio web solo desde `precio_ecommerce/ecommerce_price`; `precio_publico` no participa en venta | Búsqueda estática de referencias | Implementado |
| producto sin precio | Parcial | “Precio por consultar”, WhatsApp y bloqueo de carrito también a nivel de variante | Inspección de catálogo/detalle/Store | Implementado; backend 409 pendiente E2E |
| ID de variante en carrito/payload | Incumplido: checkout enviaba `item.product.id` y hasta fallback numérico | `CartItem.variantId`; checkout manda `id: item.variantId`; migración/revalidación de carritos viejos | Inspección del payload y revalidación | Implementado |
| límite por disponibilidad | Incumplido | `addToCart` y cambios de cantidad limitan a `availableBodega` | Inspección de Store | Implementado |
| revalidación de carrito | Primera homologación requería recarga/navegación para reflejar cambios de stock del ERP | Recarga catálogo real, actualiza ID/precio, reduce cantidades y retira variantes; monitor de inventario cada 10 s y refresh inmediato al recuperar foco/visibilidad | Inspección de `revalidateCart()` + monitor runtime | Corregido; repetir E2E con cambios reales de stock sin F5 |
| Toast | Primera homologación compilaba con TS2339 por shadowing de `toast` dentro de `@for` | Iterador renombrado a `message`; `toast.dismiss(message.id)` invoca el servicio | Revisión de plantilla + parse TS | Corregido; repetir `npm run build` |
| checkout seguro | Incumplido: tarjeta simulada / fallback de orden local ante error | Checkout no captura tarjeta; revalida antes de crear preferencia; no crea orden local si API falla | Inspección de checkout | Implementado |
| email real MP | Incumplido: opcional | Email obligatorio y validado para Mercado Pago; opcional pero validado si se captura para WhatsApp | Inspección de formulario/validación | Implementado |
| dirección con estado | Ya existía campo `state` | Se conserva y se envía separado de `city`; nombre/apellidos separados | Inspección de payload | Implementado |
| Mercado Pago same-tab | No estaba resuelto de forma estándar | `window.location.assign(init_point)` | Inspección estática | Implementado |
| CheckoutSession | No implementado | Guarda sale, preference, init point, signed status URL, expiración, totales y snapshot en `sessionStorage` | Inspección de servicio/checkout | Implementado |
| success | No implementado | Consulta URL firmada; solo confirma con `sale_status=approved` y `payment_status=paid`; muestra total firmado, Payment ID y detalle de reserva cuando backend los entrega | Inspección de `PaymentResult` | Implementado; webhook E2E pendiente |
| pending | No implementado | Consulta el pedido existente; no crea nueva Sale | Inspección de `PaymentResult` | Implementado |
| failure | No implementado | Consulta estado real; recuperación solo ante estado terminal | Inspección de `PaymentResult` | Implementado |
| signed order status | No implementado | Frontend consume exclusivamente `order_status_url/signed_status_url` entregada por backend | Inspección | Implementado; firma/rate-limit son backend y requieren E2E |
| webhook como fuente de verdad | Frontend podía presentar éxito local | Retorno ya no aprueba por query params; espera estado firmado actualizado por backend/webhook | Inspección | Alineado frontend; webhook real pendiente E2E |
| recuperación de carrito | No implementado | Snapshot → catálogo actual → revalidación → ajuste/eliminación | Inspección | Implementado; pendiente E2E |
| 409 / 422 / 403 / 503 / 500 / status 0 | Fragmentado | `errorInterceptor` global para `403/503/status 0`; checkout recupera `409 insufficient_stock` y `ecommerce_price_unavailable` refrescando catálogo/carrito; mensaje específico `mercadopago_not_available` | Inspección + 16/16 checks estáticos | Implementado; respuestas reales pendientes E2E |
| WhatsApp checkout existente | Existía, pero con fallback local aunque API fallara | Se conserva como opción secundaria; solo abre chat si GuayaFlow registra el pedido; usa IDs de variante y carrito revalidado; número centralizado en `environment.whatsappNumber` | Inspección de checkout y enlaces e-commerce | Implementado; endpoint real pendiente E2E |
| SSR | Riesgo: prerender podía congelar datos dinámicos; globals dispersos | `RenderMode.Server` para rutas; storage/window protegidos; redirect MP solo browser | Inspección y parse TypeScript | Implementado estáticamente; build SSR pendiente |
| identidad visual | Propia de Golondrina | Se conservan branding, tipografías, imágenes, layout y navegación; cambios visuales solo funcionales en checkout/estados/toasts | Diff de archivos | Conservada |

## Cierre de brechas contra la base funcional La Rosa (2026-09-16)

- **Interceptor global GuayaFlow:** se agregó `errorInterceptor` después del interceptor de tenant. Un `403 ecommerce_inactive` o `503 ecommerce_maintenance/ecommerce_configuration_unavailable` actualiza inmediatamente `EcommerceStatusService` y redirige fuera del storefront, excepto en las rutas de resultado de pago.
- **Mensaje autoritativo de estado:** `EcommerceStatusService` conserva el mensaje entregado por GuayaFlow y las pantallas maintenance/inactive pueden mostrarlo en lugar del texto estático.
- **Conectividad:** `status 0` muestra Toast global con cooldown de 15 s para evitar spam provocado por polling de status/catálogo. El error continúa propagándose al componente originador.
- **`availableBodega`:** si el endpoint entrega `availableBodega` o `available_bodega`, ese valor se considera autoritativo. Solo si no viene se calcula `qtyBodega - qtyApartado`.
- **Carrito como checkpoint:** al entrar a `/carrito` se fuerza catálogo fresco + reconciliación, además del monitor de 10 s y la revalidación previa al checkout.
- **Carrera de inventario/precio en checkout:** `409 insufficient_stock` y `409 ecommerce_price_unavailable` fuerzan actualización inmediata de `/productos/ecommerce` y reconciliación del carrito. `409 mercadopago_not_available` informa la alternativa de WhatsApp sin simular éxito.
- **Email por método:** es obligatorio y válido para Mercado Pago; en WhatsApp es opcional, pero si se captura debe tener formato válido.
- **WhatsApp configurable:** los flujos e-commerce de checkout/catálogo/detalle/wishlist usan `environment.whatsappNumber`. Los enlaces editoriales estáticos del sitio no se alteraron.
- **Resultado firmado más completo:** `success/pending/failure` muestra, cuando GuayaFlow lo entrega, estado de Sale, estado de pago, total firmado, Payment ID y estado/expiración de reserva.

## Hallazgos de validación incorporados (2026-09-15)

- **Inventario/stock en vivo:** se agregó monitoreo del catálogo real cada `10000 ms`, además de actualización inmediata al recuperar foco o visibilidad. Cada refresh exitoso vuelve a mapear variantes con `availableBodega` y reconcilia el carrito: reduce cantidades, retira variantes agotadas y actualiza `ecommerce_price`/`variantId` cuando corresponda. Se reutiliza una petición de catálogo en curso para evitar duplicados entre polling, foco y checkout. La consulta agrega `_gf_refresh=<timestamp>` para evitar snapshots servidos desde caché del navegador/intermediario.
- **Estado en vivo:** se corrigió el cache permanente del estado. El storefront consulta nuevamente en cada navegación protegida y, mientras permanece abierto, cada `10000 ms`. También fuerza refresh al volver a enfocar la ventana o hacer visible la pestaña. Las rutas `/payment/success`, `/payment/pending` y `/payment/failure` no se redirigen por cambios de estado.
- **Toast / build:** se corrigió `TS2339: Property 'dismiss' does not exist on type 'ToastMessage'`. La causa era shadowing del nombre `toast` dentro del `@for`.
- **API de validación:** `environment.ts` y `environment.prod.ts` apuntan a `https://dev-api-nacx.guayaflow.com/api`. Se alineó `environment.prod.ts` porque `npm run build` usa la configuración production y reemplaza `environment.ts`. Antes de producción real, cambiar este endpoint por el API productivo.
- **Archivos manuales del usuario:** no aparecen como archivos independientes en los adjuntos disponibles de esta sesión. Esta entrega conserva los archivos de la homologación anterior y aplica los cambios descritos arriba; si esos dos archivos contienen cambios adicionales, deben incorporarse en la siguiente iteración cuando estén disponibles.

## Checklist E2E pendiente

### Tenant
- [ ] `X-Tenant: cgolondrinas_gf` llega al backend.
- [ ] tenant existente y ningún slug ajeno.

### Estado
- [ ] `active` habilita tienda sin recarga manual (espera máxima normal: ~10 s, inmediata al recuperar foco).
- [ ] `active → maintenance` redirige sin recarga y conserva payment result.
- [ ] `maintenance → active` vuelve al storefront sin recarga.
- [ ] `active → inactive` redirige sin recarga y conserva payment result.
- [ ] `inactive → active` vuelve al storefront sin recarga.
- [ ] fallo de `/api/ecommerce/status` = fail closed.

### Catálogo / carrito
- [ ] catálogo real sin fallback.
- [ ] `availableBodega` coincide con backend.
- [ ] `ecommerce_price` coincide con backend.
- [ ] cambio de stock en ERP se refleja en catálogo sin F5 (máximo normal ~10 s; inmediato al volver a enfocar la pestaña).
- [ ] variante agotada en ERP se retira del carrito automáticamente sin F5.
- [ ] cantidad del carrito se reduce automáticamente si `availableBodega` baja por debajo de la cantidad agregada.
- [ ] cambio de talla/color manda el ID de variante correcto.
- [ ] producto sin precio no entra al carrito y bypass devuelve 409.

### Checkout / Mercado Pago
- [ ] email real llega a MP.
- [ ] estado de dirección no replica ciudad.
- [ ] backend recalcula subtotal/envío/total.
- [ ] manipulación del frontend no altera cobro.
- [ ] preference real creada.
- [ ] redirect same-tab.
- [ ] carrito permanece durante pago.

### Estado de pago / webhook
- [ ] Sale pending antes del pago.
- [ ] webhook HTTPS y `x-signature` válida.
- [ ] idempotencia evita dobles efectos.
- [ ] pago aprobado actualiza ERP/inventario.
- [ ] `sale_payment` y Payment ID quedan registrados.
- [ ] success no confía en query params.
- [ ] signed status funciona y cambia tras webhook.
- [ ] carrito se limpia solo al confirmar approved+paid.
- [ ] pending no duplica Sale.
- [ ] failure no duplica reserva y permite recuperar cuando es terminal.

### Reservas / seguridad
- [ ] reserva incrementa `qty_apartado`.
- [ ] expiración libera reserva.
- [ ] aprobado descuenta inventario sin stock negativo.
- [ ] status URL realmente firmada y rate limited.
- [ ] no se expone PII/tokens/credenciales.
- [ ] HTTPS y ausencia de `verify=false`.

## Validaciones realizadas en esta entrega

- Inspección completa del estándar `GuayaFlow E-commerce Standard v1.0` y del storefront suministrado.
- Búsqueda estática: no quedan `alert()`, `confirm()`, fallback mock de catálogo, uso de `qtyBodega` como disponibilidad comprable, ni fallback de precio web a `precio_publico`.
- Parse sintáctico de todos los archivos TypeScript con TypeScript global: **OK (35 archivos)**.
- Validación estática del cierre de brechas La Rosa/Golondrina: **16/16 checks PASS** (`errorInterceptor`, 403/503, status 0, mensaje backend, availableBodega, carrito, 409, email por método, WhatsApp configurable y detalle firmado de pago/reserva).
- Validación estática del fix de Toast: no existe ya `toast.dismiss(toast.id)` dentro del iterador; el servicio se invoca como `toast.dismiss(message.id)`.
- Validación estática del status runtime: guard con `ensureStatus(true)`, monitor periódico y exclusión de rutas de pago.
- Validación estática de sincronización de inventario: `catalogPollMs`, polling/focus/visibility, cache-buster `_gf_refresh`, reutilización de `catalogPromise` y reconciliación automática del carrito.
- Se corrigió además un token de plantilla inválido preexistente en `detalle.ts` (`@} @else`).
- `npm run build` no pudo ejecutarse porque el ZIP no incluye `node_modules`; un nuevo intento de `npm install --no-package-lock --ignore-scripts` agotó el tiempo disponible sin instalar dependencias. Debe ejecutarse localmente/CI antes de merge.

## Criterio de certificación

No usar la leyenda `GuayaFlow E-commerce Standard v1.0 — CERTIFICADO` hasta que todos los checks E2E anteriores pasen contra el backend y Mercado Pago reales.
