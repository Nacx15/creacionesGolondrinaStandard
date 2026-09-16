import {ChangeDetectionStrategy, Component, computed, inject} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {EcommerceStatusService} from '../services/ecommerce-status.service';

@Component({
  selector: 'app-store-state',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="py-20 bg-brand-cream min-h-[60vh] flex items-center">
      <div class="container mx-auto px-4">
        <div class="max-w-xl mx-auto bg-white rounded-3xl border border-gray-100 shadow-sm p-10 text-center">
          <div class="w-16 h-16 rounded-full bg-brand-light-pink text-brand-pink flex items-center justify-center mx-auto mb-5"><mat-icon class="text-3xl">{{ icon }}</mat-icon></div>
          <h1 class="font-serif-brand text-3xl font-bold text-gray-900 mb-3">{{ title }}</h1>
          <p class="text-gray-500 leading-relaxed mb-6">{{ message() }}</p>
          <a routerLink="/" class="inline-flex bg-brand-pink hover:bg-brand-dark text-white px-7 py-3 rounded-full font-semibold transition-all">Volver al inicio</a>
        </div>
      </div>
    </section>
  `
})
export class StoreStatePage {
  private readonly route = inject(ActivatedRoute);
  private readonly statusService = inject(EcommerceStatusService);
  readonly title = String(this.route.snapshot.data['title'] || 'Tienda no disponible');
  readonly fallbackMessage = String(this.route.snapshot.data['message'] || 'No es posible acceder a la tienda en este momento.');
  readonly icon = String(this.route.snapshot.data['icon'] || 'storefront');
  readonly message = computed(() => this.statusService.message() || this.fallbackMessage);
}
