import {ChangeDetectionStrategy, Component, inject, signal, computed, effect, OnInit, OnDestroy} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {Store, Product} from '../components/store';
import {Seo} from '../components/seo';
import {MatIconModule} from '@angular/material/icon';
import {Subscription} from 'rxjs';
import {environment} from '../../environments/environment';
import {ShippingPromoComponent} from '../components/shipping-promo.component';

@Component({
  selector: 'app-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, ShippingPromoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="py-12 bg-brand-cream animate-fade-in">
      <div class="container mx-auto px-4">
        <!-- Back Navigation -->
        <a routerLink="/catalogo" class="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-pink transition-colors mb-8 font-medium">
          <mat-icon class="text-base">arrow_back</mat-icon> Volver al Catálogo
        </a>

        @if (store.catalogLoading()) {
          <div class="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm max-w-xl mx-auto">
            <mat-icon class="text-brand-pink text-4xl h-10 w-10 mx-auto mb-4 animate-spin">sync</mat-icon>
            <h3 class="font-serif-brand text-2xl font-bold text-gray-900 mb-2">Cargando prenda</h3>
            <p class="text-gray-500 text-sm">Consultando información.</p>
          </div>
        } @else if (product()) {
          <!-- Main Product Area -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white p-6 md:p-10 rounded-3xl border border-gray-100 shadow-sm max-w-6xl mx-auto mb-12">
            <!-- Left Column: Product Image -->
            <div class="relative rounded-2xl overflow-hidden bg-brand-cream border border-gray-50 h-96 md:h-[500px]">
              <img 
                [src]="currentMainImage()" 
                [alt]="product()!.name" 
                class="w-full h-full object-cover"
                referrerpolicy="no-referrer"
              />
              @if (product()!.isOffer) {
                <span class="absolute top-6 left-6 bg-brand-pink text-white px-3 py-1.5 text-xs font-bold rounded-full uppercase tracking-widest shadow-md">
                  Oferta Especial
                </span>
              }
              <button 
                (click)="toggleWishlist()" 
                class="absolute top-6 right-6 w-11 h-11 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-gray-400 hover:text-brand-pink shadow-md transition-all"
              >
                <mat-icon [class.text-brand-pink]="isInWishlist()">
                  {{ isInWishlist() ? 'favorite' : 'favorite_border' }}
                </mat-icon>
              </button>
            </div>

            <!-- Right Column: Product Config & Add to Cart -->
            <div class="flex flex-col justify-between">
              <div>
                <!-- Category/Type Breadcrumbs -->
                <span class="text-xs font-semibold text-brand-pink uppercase tracking-widest block mb-2">
                  {{ product()!.category }} / {{ product()!.type }}
                </span>

                <h1 class="font-serif-brand text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">
                  {{ product()!.name }}
                </h1>

                <!-- Rating -->
                <div class="flex items-center gap-2 mb-6">
                  <div class="flex text-brand-yellow">
                    <mat-icon class="text-lg">star</mat-icon>
                    <span class="text-sm font-bold text-gray-700 ml-1">{{ product()!.rating }}</span>
                  </div>
                  <span class="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                  <span class="text-xs text-gray-500 font-medium">({{ product()!.reviewsCount }} opiniones de compradores)</span>
                  <span class="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                  <span class="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">En Existencia</span>
                </div>

                <!-- Price -->
                <div class="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                  @if (currentVariantPrice() > 0) {
                    @if (product()!.isOffer && product()!.offerPrice) {
                      <span class="text-3xl font-bold text-brand-pink">{{ '$' + product()!.offerPrice }} MXN</span>
                      <span class="text-xl text-gray-400 line-through">{{ '$' + currentVariantPrice() }} MXN</span>
                    } @else {
                      <span class="text-3xl font-bold text-gray-900">{{ '$' + currentVariantPrice() }} MXN</span>
                    }
                  } @else {
                    <div class="flex flex-col">
                      <span class="text-2xl md:text-3xl font-bold text-amber-700">Precio por consultar</span>
                      <span class="text-xs text-gray-500 font-medium mt-1">Consulta el precio directamente por WhatsApp</span>
                    </div>
                  }
                </div>

                <app-shipping-promo class="block mb-6" />

                @if (currentVariantPrice() <= 0) {
                  <!-- Price Not Available Notice -->
                  <div class="mb-6 p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 flex items-start gap-3">
                    <mat-icon class="text-amber-600 mt-0.5">info</mat-icon>
                    <div class="text-xs md:text-sm leading-relaxed">
                      <strong class="font-bold block mb-0.5">Precio por consultar en línea</strong>
                      El precio de esta prenda no está disponible para compra directa en la tienda en línea. Por favor consulta el precio y disponibilidad por WhatsApp para atenderte de forma personalizada.
                    </div>
                  </div>
                }

                <!-- Brief description -->
                <p class="text-gray-600 text-sm md:text-base leading-relaxed mb-6">
                  {{ product()!.description }}
                </p>

                <!-- Color Selector -->
                <div class="mb-6">
                  <span class="block text-sm font-semibold text-gray-700 mb-2">
                    Color: <strong class="text-gray-900 font-bold ml-1">{{ selectedColor() || 'Elige' }}</strong>
                  </span>
                  <div class="flex gap-3 flex-wrap">
                    @for (col of product()!.colors; track col) {
                      <button 
                        (click)="selectColor(col)"
                        [class]="selectedColor() === col ? 'ring-2 ring-brand-pink border-brand-pink scale-105 shadow-sm' : 'border-gray-200 hover:border-gray-400 hover:scale-102'"
                        class="w-16 h-16 rounded-xl border-2 overflow-hidden transition-all bg-white p-0.5 flex items-center justify-center relative cursor-pointer"
                        [title]="col"
                      >
                        <img 
                          [src]="getColorImage(col)" 
                          [alt]="col" 
                          class="w-full h-full object-cover rounded-lg"
                          referrerpolicy="no-referrer"
                        />
                        <span 
                          [style.background-color]="getColorHex(col)"
                          class="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border border-white shadow-sm"
                        ></span>
                      </button>
                    }
                  </div>
                </div>
                 <!-- Size Selector -->
                <div class="mb-8">
                  <span class="block text-sm font-semibold text-gray-700 mb-2">
                    Talla: <strong class="text-gray-900 font-bold ml-1">{{ selectedSize() || 'Elige' }}</strong>
                  </span>
                  <div class="flex gap-3 flex-wrap">
                    @for (size of product()!.sizes; track size) {
                      @let info = getSizeInfo(size);
                      @let available = isSizeAvailable(size);
                      <button 
                        (click)="available ? selectedSize.set(size) : null"
                        [class]="selectedSize() === size 
                          ? 'border-brand-pink border-2 bg-brand-pink/5 text-brand-pink font-semibold scale-105 shadow-sm' 
                          : available 
                            ? 'border-gray-200 bg-white hover:border-gray-400 text-gray-800 font-medium' 
                            : 'border-dashed border-gray-300 bg-gray-50/50 text-gray-400 opacity-40 cursor-not-allowed'"
                        class="w-16 h-16 rounded-xl border flex flex-col items-center justify-center text-center transition-all p-2 cursor-pointer"
                        [title]="available ? 'Disponible en talla ' + size : 'Sin existencia en talla ' + size"
                      >
                        <span class="text-base font-bold tracking-tight uppercase block leading-tight">{{ info.top }}</span>
                        <!-- <span class="text-[10px] font-medium text-gray-500 block leading-tight uppercase mt-0.5">{{ info.bottom }}</span> -->
                      </button>
                    }
                  </div>
                </div>
              </div>

              <!-- Quantity Selector and Action buttons -->
              <div class="pt-6 border-t border-gray-100">
                @if (currentVariantPrice() > 0) {
                  <div class="flex flex-col sm:flex-row gap-4">
                    <!-- Quantity -->
                    <div class="flex items-center justify-between border border-gray-100 bg-brand-cream rounded-xl p-1.5 w-full sm:w-32 h-14">
                      <button (click)="decreaseQty()" class="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-brand-pink transition-colors">
                        <mat-icon>remove</mat-icon>
                      </button>
                      <span class="font-bold text-gray-800 text-base">{{ quantity() }}</span>
                      <button (click)="increaseQty()" class="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-brand-pink transition-colors">
                        <mat-icon>add</mat-icon>
                      </button>
                    </div>

                    <!-- Add Button -->
                    <button 
                      (click)="canAddToCart() ? addToCart() : null" 
                      [disabled]="!canAddToCart()"
                      [class]="canAddToCart() 
                        ? 'bg-brand-pink hover:bg-brand-dark text-white cursor-pointer hover:shadow-brand-pink/10 shadow-lg' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'"
                      class="flex-1 text-base font-semibold rounded-xl h-14 transition-all flex items-center justify-center gap-2"
                    >
                      <mat-icon>add_shopping_cart</mat-icon> Agregar al Carrito
                    </button>
                  </div>

                  <!-- WhatsApp Custom Pre-filled CTA -->
                  <a 
                    [href]="whatsappUrl()" 
                    target="_blank" 
                    class="mt-4 w-full h-12 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] font-semibold text-xs rounded-xl flex items-center justify-center gap-2 border border-[#25D366]/20 transition-all"
                  >
                    <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.335 4.975L2 22l5.13-1.347a9.957 9.957 0 0 0 4.88 1.285h.005c5.507 0 9.99-4.474 9.992-9.986a9.94 9.94 0 0 0-2.927-7.064A9.925 9.925 0 0 0 12.012 2zm5.72 14.102c-.252.712-1.461 1.305-2.012 1.392-.5.08-1.15.117-1.826-.1-.415-.133-.925-.327-1.575-.61-2.766-1.202-4.546-4.005-4.683-4.192-.136-.188-1.114-1.485-1.114-2.833 0-1.348.705-2.012.956-2.28.252-.268.553-.335.737-.335.184 0 .368.002.528.01.163.007.385-.062.602.46.225.54.77 1.88.836 2.016.066.134.11.29.02.47-.09.18-.135.3-.27.456-.136.156-.285.35-.407.47-.136.133-.277.278-.12.548.156.268.692 1.13 1.486 1.834.1.088.196.173.29.253.945.812 1.69 1.054 1.93.125.133.155-.022.355-.135.49-.112.134-.495.58-.63.782-.134.202-.27.402.002.553.27.153 1.714.846 2.115 1.05.4.202.668.298.766.14.098-.157.4-.403.548-.56.148-.158.29-.134.49-.06.202.072 1.28.605 1.503.71.224.11.373.16.428.25.056.1.056.578-.196 1.29z"/>
                    </svg>
                    Preguntar por WhatsApp sobre esta prenda
                  </a>
                } @else {
                  <!-- Price 0: WhatsApp Direct Inquiry Button -->
                  <a 
                    [href]="whatsappUrl()" 
                    target="_blank" 
                    class="w-full h-14 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-sm md:text-base rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20 transition-all cursor-pointer"
                  >
                    <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.335 4.975L2 22l5.13-1.347a9.957 9.957 0 0 0 4.88 1.285h.005c5.507 0 9.99-4.474 9.992-9.986a9.94 9.94 0 0 0-2.927-7.064A9.925 9.925 0 0 0 12.012 2zm5.72 14.102c-.252.712-1.461 1.305-2.012 1.392-.5.08-1.15.117-1.826-.1-.415-.133-.925-.327-1.575-.61-2.766-1.202-4.546-4.005-4.683-4.192-.136-.188-1.114-1.485-1.114-2.833 0-1.348.705-2.012.956-2.28.252-.268.553-.335.737-.335.184 0 .368.002.528.01.163.007.385-.062.602.46.225.54.77 1.88.836 2.016.066.134.11.29.02.47-.09.18-.135.3-.27.456-.136.156-.285.35-.407.47-.136.133-.277.278-.12.548.156.268.692 1.13 1.486 1.834.1.088.196.173.29.253.945.812 1.69 1.054 1.93.125.133.155-.022.355-.135.49-.112.134-.495.58-.63.782-.134.202-.27.402.002.553.27.153 1.714.846 2.115 1.05.4.202.668.298.766.14.098-.157.4-.403.548-.56.148-.158.29-.134.49-.06.202.072 1.28.605 1.503.71.224.11.373.16.428.25.056.1.056.578-.196 1.29z"/>
                    </svg>
                    Preguntar Precio por WhatsApp
                  </a>
                }
              </div>
            </div>
          </div>

          <!-- Product Story / Specifications -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
            <div class="md:col-span-2 bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm">
              <h3 class="font-serif-brand text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-50">
                Detalles del Confeccionado
              </h3>
              <p class="text-gray-700 leading-relaxed text-sm md:text-base">
                {{ product()!.detailed_desc }}
              </p>
            </div>

            <div class="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm self-start">
              <h3 class="font-serif-brand text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-50">
                Ficha Técnica
              </h3>
              <div class="space-y-3 text-xs md:text-sm">
                <div class="flex justify-between py-1.5 border-b border-gray-50">
                  <span class="text-gray-400">Tejido/Tela</span>
                  <span class="font-semibold text-gray-800">{{ product()!.fabric }}</span>
                </div>
                <div class="flex justify-between py-1.5 border-b border-gray-50">
                  <span class="text-gray-400">Tipo de Bordado</span>
                  <span class="font-semibold text-brand-pink text-right max-w-[150px]">{{ product()!.embroidery }}</span>
                </div>
                <div class="flex justify-between py-1.5 border-b border-gray-50">
                  <span class="text-gray-400">Origen</span>
                  <span class="font-semibold text-gray-800">Tekit, Yucatán, MX</span>
                </div>
                <div class="flex justify-between py-1.5 border-b border-gray-50">
                  <span class="text-gray-400">Cuidados</span>
                  <span class="font-semibold text-gray-800 text-right">Lavar a mano, secar a la sombra</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Reviews Section -->
          <div class="bg-white p-6 md:p-10 rounded-3xl border border-gray-100 shadow-sm max-w-6xl mx-auto">
            <h3 class="font-serif-brand text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-50 flex items-center gap-2">
              <mat-icon class="text-brand-yellow">star_rate</mat-icon> Opiniones de Clientes
            </h3>

            @if (product()!.reviews.length === 0) {
              <p class="text-gray-400 text-center py-6 text-sm">Esta prenda aún no cuenta con reseñas de compradores. ¡Sé el primero en calificarla!</p>
            } @else {
              <div class="space-y-6">
                @for (rev of product()!.reviews; track rev.author) {
                  <div class="border-b border-gray-50 pb-6 last:border-0 last:pb-0">
                    <div class="flex justify-between items-start mb-2">
                      <div>
                        <span class="font-bold text-gray-800 text-sm md:text-base">{{ rev.author }}</span>
                        <div class="flex text-brand-yellow text-sm mt-0.5">
                          @for (st of [1,2,3,4,5]; track st) {
                            <mat-icon class="text-sm h-4 w-4">star</mat-icon>
                          }
                        </div>
                      </div>
                      <span class="text-xs text-gray-400">{{ rev.date }}</span>
                    </div>
                    <p class="text-gray-600 text-xs md:text-sm leading-relaxed italic">
                      "{{ rev.comment }}"
                    </p>
                  </div>
                }
              </div>
            }
          </div>
        } @else {
          <div class="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm max-w-xl mx-auto">
            <mat-icon class="text-brand-pink text-5xl h-12 w-12 mx-auto mb-4">error_outline</mat-icon>
            <h3 class="font-serif-brand text-2xl font-bold text-gray-900 mb-2">Prenda no encontrada</h3>
            <p class="text-gray-500 mb-6 text-sm">{{ store.catalogError() || 'El identificador del producto es inválido o el producto ya no se encuentra en catálogo.' }}</p>
            <a routerLink="/catalogo" class="bg-brand-pink text-white px-6 py-2.5 rounded-full text-xs font-semibold hover:bg-brand-dark transition-all">
              Volver al Catálogo
            </a>
          </div>
        }
      </div>
    </section>

    <!-- Floating Bottom-Right Toast Notification -->
    @if (showAddedToast() && addedProductInfo()) {
      <div id="cart-added-toast" class="fixed bottom-6 right-6 z-50 max-w-sm w-[340px] md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 animate-slide-in-right flex gap-3 items-start">
        <div class="w-16 h-16 rounded-xl overflow-hidden bg-brand-cream border border-gray-50 flex-shrink-0">
          <img [src]="addedProductInfo()!.image" [alt]="addedProductInfo()!.name" class="w-full h-full object-cover" referrerpolicy="no-referrer" />
        </div>
        <div class="flex-1">
          <div class="flex items-start justify-between">
            <span class="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full inline-block mb-1">¡Agregado al carrito!</span>
            <button (click)="showAddedToast.set(false)" class="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer flex items-center justify-center">
              <mat-icon class="text-lg">close</mat-icon>
            </button>
          </div>
          <h4 class="font-serif-brand font-bold text-sm text-gray-900 leading-snug mb-0.5">
            {{ addedProductInfo()!.name }}
          </h4>
          <p class="text-[11px] text-gray-500 font-medium mb-3">
            Talla: <span class="text-gray-800 font-bold">{{ addedProductInfo()!.size }}</span> &middot; 
            Color: <span class="text-gray-800 font-bold">{{ addedProductInfo()!.color }}</span> &middot; 
            Cant: <span class="text-gray-800 font-bold">{{ addedProductInfo()!.quantity }}</span>
          </p>
          <div class="flex gap-2">
            <a routerLink="/carrito" class="flex-1 text-center bg-brand-pink hover:bg-brand-dark text-white text-xs font-bold py-2 rounded-lg shadow-sm transition-all cursor-pointer">
              Ver Carrito
            </a>
            <button (click)="showAddedToast.set(false)" class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold py-2 rounded-lg transition-all cursor-pointer">
              Seguir comprando
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .animate-fade-in {
      animation: fadeIn 0.4s ease-out forwards;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .scale-102 {
      transform: scale(1.02);
    }
    .animate-slide-in-right {
      animation: slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  `
})
export class Detalle implements OnInit, OnDestroy {
  readonly store = inject(Store);
  private readonly seo = inject(Seo);
  private readonly route = inject(ActivatedRoute);

  readonly productId = signal<string | null>(null);
  readonly product = computed(() => {
    const id = this.productId();
    return id ? this.store.products().find((p) => p.id === id) || null : null;
  });

  readonly currentMainImage = computed(() => {
    const prod = this.product();
    if (!prod) return '';
    const color = this.selectedColor();
    if (!color) return prod.image;
    return this.getColorImage(color);
  });

  readonly selectedSize = signal<string>('');
  readonly selectedColor = signal<string>('');
  readonly quantity = signal<number>(1);

  readonly currentVariant = computed(() => {
    const prod = this.product();
    if (!prod) return undefined;
    return this.store.getVariant(prod, this.selectedSize(), this.selectedColor());
  });
  readonly currentVariantPrice = computed(() => this.currentVariant()?.precio_ecommerce ?? this.product()?.precio_ecommerce ?? 0);
  readonly currentAvailability = computed(() => this.currentVariant()?.availableBodega ?? 0);

  readonly showAddedToast = signal<boolean>(false);
  readonly addedProductInfo = signal<{ name: string; size: string; color: string; quantity: number; image: string } | null>(null);
  private toastTimeout: ReturnType<typeof setTimeout> | null = null;

  private sub?: Subscription;

  constructor() {
    // Effect to auto-select initial color and first available size, and set SEO once product is loaded/changes
    effect(() => {
      const p = this.product();
      if (p) {
        const initialColor = p.colors && p.colors.length > 0 ? p.colors[0] : 'Blanco';
        this.selectedColor.set(initialColor);
        
        const initialSize = this.getFirstAvailableSize(p, initialColor);
        this.selectedSize.set(initialSize);
        this.quantity.set(1);

        // SEO update for this specific product
        this.seo.setProductMeta({
          name: p.name,
          description: p.description,
          price: p.isOffer && p.offerPrice ? p.offerPrice : p.price,
          image: p.image,
          category: p.category
        });
      }
    });
  }

  getFirstAvailableSize(prod: Product, colorName: string): string {
    if (!prod) return '';
    if (prod.sizes && prod.sizes.length > 0) {
      // Find first size with stock > 0 for this color
      const available = prod.sizes.find((size) =>
        prod.variantes?.some((v) => v.color === colorName && v.talla === size && v.availableBodega > 0)
      );
      if (available) return available;
      return prod.sizes[0];
    }
    return '';
  }

  selectColor(color: string) {
    this.selectedColor.set(color);
    const prod = this.product();
    if (prod) {
      // If current size is available in the new color, keep it; otherwise pick first available size
      const currentSize = this.selectedSize();
      const isCurrentAvailable = prod.variantes?.some(
        (v) => v.color === color && v.talla === currentSize && v.availableBodega > 0
      );
      if (!isCurrentAvailable) {
        this.selectedSize.set(this.getFirstAvailableSize(prod, color));
      }
    }
  }

  getColorImage(colorName: string): string {
    const prod = this.product();
    if (!prod) return '';
    const variant = prod.variantes?.find((v) => v.color === colorName);
    if (variant) {
      const colorIdStr = String(variant.color_id);
      const colorImgEntry = prod.color_images?.find((ci) => String(ci.color_id) === colorIdStr);
      if (colorImgEntry && colorImgEntry.images_url && colorImgEntry.images_url.length > 0 && colorImgEntry.images_url[0]) {
        return colorImgEntry.images_url[0];
      }
    }
    return prod.image;
  }

  getColorHex(colorName: string): string {
    const prod = this.product();
    if (!prod || !prod.variantes) return '#cccccc';
    const variant = prod.variantes.find((v) => v.color === colorName);
    return variant?.hex || '#cccccc';
  }

  isSizeAvailable(size: string): boolean {
    const prod = this.product();
    const color = this.selectedColor();
    if (!prod || !prod.variantes || !color) return false;
    return prod.variantes.some((v) => v.color === color && v.talla === size && v.availableBodega > 0);
  }

  canAddToCart(): boolean {
    const prod = this.product();
    if (!prod || this.currentVariantPrice() <= 0) return false;
    const size = this.selectedSize();
    if (!size) return false;
    return this.isSizeAvailable(size) && this.currentAvailability() > 0;
  }

  getSizeInfo(size: string): { top: string } {
    const s = size.trim();    
    return { top: s };
  }

  ngOnInit() {
    this.sub = this.route.params.subscribe((params) => {
      this.productId.set(params['id'] || null);

      // Every product-detail navigation is a commercial checkpoint. This refreshes
      // the selected product/variants and also lets 403/503 responses update the
      // ecommerce status through the global interceptor. In-flight calls are reused.
      void this.store.loadProducts(true, true);

      if (typeof window !== 'undefined') window.scrollTo(0, 0);
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
  }

  increaseQty() {
    this.quantity.update((q) => Math.min(q + 1, Math.max(1, this.currentAvailability())));
  }

  decreaseQty() {
    this.quantity.update((q) => Math.max(1, q - 1));
  }

  addToCart() {
    const prod = this.product();
    if (prod && this.currentVariantPrice() > 0) {
      const added = this.store.addToCart(prod, this.quantity(), this.selectedSize(), this.selectedColor());
      if (!added) return;
      
      // Update toast info and show it
      this.addedProductInfo.set({
        name: prod.name,
        size: this.selectedSize(),
        color: this.selectedColor(),
        quantity: this.quantity(),
        image: this.currentMainImage()
      });
      this.showAddedToast.set(true);

      // Clear previous timeout if exists
      if (this.toastTimeout) {
        clearTimeout(this.toastTimeout);
      }

      // Automatically hide toast after 5 seconds
      this.toastTimeout = setTimeout(() => {
        this.showAddedToast.set(false);
      }, 5000);
    }
  }

  toggleWishlist() {
    const prod = this.product();
    if (prod) {
      this.store.toggleWishlist(prod.id);
    }
  }

  isInWishlist(): boolean {
    const prod = this.product();
    return prod ? this.store.isInWishlist(prod.id) : false;
  }

  whatsappUrl(): string {
    const prod = this.product();
    if (!prod) return '';
    const sizeInfo = this.selectedSize() ? ` en talla ${this.selectedSize()}` : '';
    const colorInfo = this.selectedColor() ? ` y color ${this.selectedColor()}` : '';
    const isPriceZero = this.currentVariantPrice() <= 0;

    const message = isPriceZero
      ? `Hola, me gustaría consultar el precio y disponibilidad de la prenda: "${prod.name}" (Ref: ${prod.ref_code || prod.id})${sizeInfo}${colorInfo} de Creaciones Golondrina.`
      : `Hola, me interesa obtener información sobre la prenda: "${prod.name}" (Ref: ${prod.ref_code || prod.id})${sizeInfo}${colorInfo}. ¿Tienen disponibles en Tekit?`;
    
    return `https://wa.me/${environment.whatsappNumber}?text=${encodeURIComponent(message)}`;
  }
}
