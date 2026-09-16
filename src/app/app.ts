import {ChangeDetectionStrategy, Component, effect, inject} from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
import {Header} from './components/header';
import {Footer} from './components/footer';
import {ToastContainer} from './components/toast-container';
import {EcommerceRuntimeStatus, EcommerceStatusService} from './services/ecommerce-status.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, ToastContainer],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly router = inject(Router);
  private readonly ecommerceStatus = inject(EcommerceStatusService);

  constructor() {
    this.ecommerceStatus.startMonitoring();

    effect(() => {
      const status = this.ecommerceStatus.status();
      if (status === 'checking') return;

      const currentPath = this.router.url.split('?')[0].split('#')[0];
      if (this.isPaymentResultRoute(currentPath)) return;

      const target = this.targetForStatus(status, currentPath);
      if (target && target !== currentPath) {
        void this.router.navigateByUrl(target, {replaceUrl: true});
      }
    });
  }

  private targetForStatus(status: EcommerceRuntimeStatus, currentPath: string): string | null {
    if (status === 'active') {
      return this.isStoreStateRoute(currentPath) ? '/' : null;
    }
    if (status === 'maintenance') return '/maintenance';
    if (status === 'inactive') return '/inactive';
    if (status === 'unavailable') return '/store-unavailable';
    return null;
  }

  private isStoreStateRoute(path: string): boolean {
    return path === '/maintenance' || path === '/inactive' || path === '/store-unavailable';
  }

  private isPaymentResultRoute(path: string): boolean {
    return path === '/payment/success' || path === '/payment/pending' || path === '/payment/failure';
  }
}
