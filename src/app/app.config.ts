import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import {provideRouter} from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http'; 

import {routes} from './app.routes';
import {tenantInterceptor} from './interceptors/tenant.interceptor';
import {errorInterceptor} from './interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([tenantInterceptor, errorInterceptor]))
  ],
};

