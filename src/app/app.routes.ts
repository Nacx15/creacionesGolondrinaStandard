import {Routes} from '@angular/router';
import {ecommerceStatusGuard} from './guards/ecommerce-status.guard';

export const routes: Routes = [
  {path: '', canActivate: [ecommerceStatusGuard], loadComponent: () => import('./pages/inicio').then((m) => m.Inicio)},
  {path: 'servicios', canActivate: [ecommerceStatusGuard], loadComponent: () => import('./pages/servicios').then((m) => m.Servicios)},
  {path: 'nosotros', canActivate: [ecommerceStatusGuard], loadComponent: () => import('./pages/nosotros').then((m) => m.Nosotros)},
  {path: 'catalogo', canActivate: [ecommerceStatusGuard], loadComponent: () => import('./pages/catalogo').then((m) => m.Catalogo)},
  {path: 'producto/:id', canActivate: [ecommerceStatusGuard], loadComponent: () => import('./pages/detalle').then((m) => m.Detalle)},
  {path: 'carrito', canActivate: [ecommerceStatusGuard], loadComponent: () => import('./pages/carrito').then((m) => m.Carrito)},
  {path: 'checkout', canActivate: [ecommerceStatusGuard], loadComponent: () => import('./pages/checkout').then((m) => m.Checkout)},
  {path: 'wishlist', canActivate: [ecommerceStatusGuard], loadComponent: () => import('./pages/wishlist').then((m) => m.Wishlist)},
  {path: 'usuario', canActivate: [ecommerceStatusGuard], loadComponent: () => import('./pages/usuario').then((m) => m.Usuario)},

  // Payment result routes intentionally remain unguarded so they work during maintenance/inactive states.
  {path: 'payment/success', data: {mode: 'success'}, loadComponent: () => import('./pages/payment-result').then((m) => m.PaymentResult)},
  {path: 'payment/pending', data: {mode: 'pending'}, loadComponent: () => import('./pages/payment-result').then((m) => m.PaymentResult)},
  {path: 'payment/failure', data: {mode: 'failure'}, loadComponent: () => import('./pages/payment-result').then((m) => m.PaymentResult)},

  {path: 'maintenance', data: {title: 'Estamos en mantenimiento', message: 'Creaciones Golondrina está realizando ajustes en su tienda en línea. El catálogo y checkout permanecerán bloqueados temporalmente.', icon: 'construction'}, loadComponent: () => import('./pages/store-state').then((m) => m.StoreStatePage)},
  {path: 'inactive', data: {title: 'Tienda temporalmente inactiva', message: 'La tienda en línea de Creaciones Golondrina no está disponible en este momento.', icon: 'storefront'}, loadComponent: () => import('./pages/store-state').then((m) => m.StoreStatePage)},
  {path: 'store-unavailable', data: {title: 'No pudimos validar la tienda', message: 'Por seguridad, el e-commerce permanece cerrado hasta que se pueda confirmar su estado.', icon: 'cloud_off'}, loadComponent: () => import('./pages/store-state').then((m) => m.StoreStatePage)},
  {path: '**', redirectTo: ''},
];
