import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {EcommerceStatusService} from '../services/ecommerce-status.service';

export const ecommerceStatusGuard: CanActivateFn = async () => {
  const statusService = inject(EcommerceStatusService);
  const router = inject(Router);

  // Always revalidate on guarded navigation. The runtime monitor handles changes while
  // the visitor remains on the same page.
  const status = await statusService.ensureStatus(true);
  if (status === 'active') return true;
  if (status === 'maintenance') return router.createUrlTree(['/maintenance']);
  if (status === 'inactive') return router.createUrlTree(['/inactive']);
  return router.createUrlTree(['/store-unavailable']);
};
