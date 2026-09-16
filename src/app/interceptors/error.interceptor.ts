import {isPlatformBrowser} from '@angular/common';
import {HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import {PLATFORM_ID, inject} from '@angular/core';
import {Router} from '@angular/router';
import {catchError, throwError} from 'rxjs';
import {EcommerceStatusService} from '../services/ecommerce-status.service';
import {ToastService} from '../services/toast.service';

let lastConnectivityToastAt = 0;
const CONNECTIVITY_TOAST_COOLDOWN_MS = 15000;

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  const statusService = inject(EcommerceStatusService);
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const code = String(error.error?.code ?? '').toLowerCase();
      const message = error.error?.message ?? error.error?.mensajeError ?? null;
      const backendMessage = typeof message === 'string' ? message : null;
      const browser = isPlatformBrowser(platformId);
      const paymentResultRoute = router.url.startsWith('/payment/');

      if (
        error.status === 503 &&
        (code === 'ecommerce_maintenance' || code === 'ecommerce_configuration_unavailable')
      ) {
        statusService.setFromHttpState('maintenance', backendMessage);
        if (browser && !paymentResultRoute) {
          void router.navigateByUrl('/maintenance', {replaceUrl: true});
        }
      } else if (error.status === 403 && code === 'ecommerce_inactive') {
        statusService.setFromHttpState('inactive', backendMessage);
        if (browser && !paymentResultRoute) {
          void router.navigateByUrl('/inactive', {replaceUrl: true});
        }
      } else if (error.status === 0 && browser) {
        const now = Date.now();
        if (now - lastConnectivityToastAt >= CONNECTIVITY_TOAST_COOLDOWN_MS) {
          lastConnectivityToastAt = now;
          toast.error('No pudimos conectar con GuayaFlow. Verifica tu conexión e inténtalo nuevamente.');
        }
      }

      // 409 / 422 / 500 remain available to the originating component so it can
      // apply operation-specific recovery (for example checkout cart refresh).
      return throwError(() => error);
    }),
  );
};
