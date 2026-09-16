import {ChangeDetectionStrategy, Component, inject, OnInit, computed} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router, RouterLink} from '@angular/router';
import {Store, Product} from '../components/store';
import {Seo} from '../components/seo';
import {MatIconModule} from '@angular/material/icon';
import {environment} from '../../environments/environment';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="py-12 bg-brand-cream animate-fade-in text-xs md:text-sm">
      <div class="container mx-auto px-4">
        <!-- Header -->
        <div class="text-center max-w-xl mx-auto mb-12">
          <h1 class="font-serif-brand text-4xl font-bold text-gray-900">Lista de Deseos</h1>
          <div class="w-12 h-1 bg-brand-pink mx-auto mt-2 rounded-full mb-4"></div>
          <p class="text-gray-500">
            Tus prendas preferidas bordadas en Tekit. Guárdalas para después o agrégalas al carrito en un clic.
          </p>
        </div>

        @if (wishlistItems().length === 0) {
          <!-- Empty wishlist -->
          <div class="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[300px]">
            <div class="w-16 h-16 rounded-full bg-brand-light-pink flex items-center justify-center text-brand-pink mb-4">
              <mat-icon class="text-3xl">favorite_border</mat-icon>
            </div>
            <h3 class="font-serif-brand text-2xl font-bold text-gray-900 mb-2">Tu lista de deseos está vacía</h3>
            <p class="text-gray-500 max-w-sm mb-6 leading-relaxed">
              ¿Aún no has marcado tus prendas favoritas? Navega por el catálogo y haz clic en el corazón de las guayaberas y vestidos que más te gusten.
            </p>
            <a routerLink="/catalogo" class="bg-brand-pink hover:bg-brand-dark text-white px-8 py-3 rounded-full font-semibold transition-all shadow-md">
              Explorar Catálogo
            </a>
          </div>
        } @else {
          <!-- Wishlist Grid -->
          <div class="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            @for (product of wishlistItems(); track product.id) {
              <div class="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative">
                <!-- Delete from wishlist action -->
                <button 
                  (click)="remove(product.id); $event.stopPropagation()" 
                  class="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-brand-pink hover:scale-105 shadow-sm transition-all"
                  title="Eliminar de favoritos"
                >
                  <mat-icon>favorite</mat-icon>
                </button>

                <!-- Product Image (Clickable to detail) -->
                <a 
                  [routerLink]="['/producto', product.id]" 
                  class="h-60 overflow-hidden bg-brand-cream relative block cursor-pointer"
                  title="Ver detalle de {{ product.name }}"
                >
                  <img [src]="product.image" [alt]="product.name" class="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" referrerpolicy="no-referrer" />
                  @if (product.isOffer) {
                    <span class="absolute top-4 left-4 bg-brand-pink text-white px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider">
                      Oferta
                    </span>
                  }
                </a>

                <!-- Content details -->
                <div class="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span class="text-[10px] uppercase font-bold tracking-wider text-gray-400 block mb-1">
                      {{ product.category }} &bull; {{ product.type }}
                    </span>
                    <a 
                      [routerLink]="['/producto', product.id]" 
                      class="block focus:outline-none cursor-pointer"
                      title="Ver detalle de {{ product.name }}"
                    >
                      <h3 class="font-serif-brand font-bold text-base text-gray-900 leading-snug mb-2 group-hover:text-brand-pink transition-colors">
                        {{ product.name }}
                      </h3>
                    </a>
                  </div>

                  <!-- CTAs -->
                  <div class="pt-4 border-t border-gray-50 flex items-end justify-between gap-2">
                    <div class="flex flex-col">
                      @if (product.price > 0) {
                        @if (product.isOffer && product.offerPrice) {
                          <span class="font-bold text-brand-pink">{{ '$' + product.offerPrice }} MXN</span>
                          <span class="text-[10px] text-gray-400 line-through">{{ '$' + product.price }} MXN</span>
                        } @else {
                          <span class="font-bold text-gray-950">{{ '$' + product.price }} MXN</span>
                        }
                      } @else {
                        <span class="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md inline-block w-fit">
                          Precio no disponible
                        </span>
                        <span class="text-[10px] text-gray-500 mt-0.5">Consultar por Whats</span>
                      }
                    </div>

                    <div class="flex flex-col items-end gap-2">
                      <!-- Colores Disponibles -->
                      @if (product.colorList && product.colorList.length > 0) {
                        <div class="flex gap-1 items-center" title="Colores disponibles">
                          @for (col of product.colorList; track col.name) {
                            <span 
                              class="w-3.5 h-3.5 rounded-full border border-gray-200 block shadow-xs transition-transform hover:scale-115"
                              [style.backgroundColor]="col.hex"
                              [title]="col.name"
                            ></span>
                          }
                        </div>
                      }
                      <div class="flex items-center gap-1.5">
                        @if (product.price === 0) {
                          <a 
                            [href]="getWhatsAppUrl(product)"
                            target="_blank"
                            class="bg-[#25D366] hover:bg-[#1EBE5D] text-white px-2 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 shadow-xs"
                            title="Preguntar precio por WhatsApp"
                          >
                            <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                              <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.335 4.975L2 22l5.13-1.347a9.957 9.957 0 0 0 4.88 1.285h.005c5.507 0 9.99-4.474 9.992-9.986a9.94 9.94 0 0 0-2.927-7.064A9.925 9.925 0 0 0 12.012 2zm5.72 14.102c-.252.712-1.461 1.305-2.012 1.392-.5.08-1.15.117-1.826-.1-.415-.133-.925-.327-1.575-.61-2.766-1.202-4.546-4.005-4.683-4.192-.136-.188-1.114-1.485-1.114-2.833 0-1.348.705-2.012.956-2.28.252-.268.553-.335.737-.335.184 0 .368.002.528.01.163.007.385-.062.602.46.225.54.77 1.88.836 2.016.066.134.11.29.02.47-.09.18-.135.3-.27.456-.136.156-.285.35-.407.47-.136.133-.277.278-.12.548.156.268.692 1.13 1.486 1.834.1.088.196.173.29.253.945.812 1.69 1.054 1.93.125.133.155-.022.355-.135.49-.112.134-.495.58-.63.782-.134.202-.27.402.002.553.27.153 1.714.846 2.115 1.05.4.202.668.298.766.14.098-.157.4-.403.548-.56.148-.158.29-.134.49-.06.202.072 1.28.605 1.503.71.224.11.373.16.428.25.056.1.056.578-.196 1.29z"/>
                            </svg>
                            Preguntar
                          </a>
                        }
                        <button 
                          (click)="addToCart(product)"
                          class="bg-brand-pink hover:bg-brand-dark text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1"
                        >
                          <mat-icon class="text-base h-4 w-4">visibility</mat-icon> Ver
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </section>
  `,
  styles: `
    .animate-fade-in {
      animation: fadeIn 0.4s ease-out forwards;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `
})
export class Wishlist implements OnInit {
  readonly store = inject(Store);
  private readonly seo = inject(Seo);
  private readonly router = inject(Router);

  readonly wishlistItems = computed(() => {
    return this.store.products().filter(p => this.store.wishlist().includes(p.id));
  });

  ngOnInit() {
    this.seo.setMetaTags(
      'Mi Lista de Deseos',
      'Revisa tu colección de prendas yucatecas seleccionadas de Creaciones Golondrina y agrégalas a tu carrito de compras de forma rápida.',
      ['mi wishlist', 'favoritos guayaberas', 'prendas guardadas Tekit']
    );
  }

  remove(id: string) {
    this.store.toggleWishlist(id);
  }

  addToCart(product: Product) {
    this.router.navigate(['/producto', product.id]);
  }

  getWhatsAppUrl(product: Product): string {
    const text = encodeURIComponent(
      `Hola, me gustaría consultar el precio y disponibilidad de la prenda "${product.name}" (Ref: ${product.ref_code || product.id}) de Creaciones Golondrina.`
    );
    return `https://wa.me/${environment.whatsappNumber}?text=${text}`;
  }
}
