import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {EcommerceStatusService} from '../services/ecommerce-status.service';

export const ecommerceStatusGuard: CanActivateFn = async () => {
  const statusService = inject(EcommerceStatusService);
  const router = inject(Router);

  // Reuses the cached status while its TTL is valid. Once stale, navigation becomes
  // an opportunistic checkpoint without turning route changes into constant polling.
  const status = await statusService.ensureStatus();
  if (status === 'active') return true;
  if (status === 'maintenance') return router.createUrlTree(['/maintenance']);
  if (status === 'inactive') return router.createUrlTree(['/inactive']);
  return router.createUrlTree(['/store-unavailable']);
};
