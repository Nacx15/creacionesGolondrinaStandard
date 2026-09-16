import {HttpInterceptorFn} from '@angular/common/http';
import {environment} from '../../environments/environment';

export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiUrl)) return next(req);
  return next(req.clone({setHeaders: {'X-Tenant': environment.tenant}}));
};
