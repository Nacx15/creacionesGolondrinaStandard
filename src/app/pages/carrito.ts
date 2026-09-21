import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import {Store, CartItem} from '../components/store';
import {Seo} from '../components/seo';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="py-12 bg-brand-cream animate-fade-in">
      <div class="container mx-auto px-4">
        <!-- Header -->
        <div class="text-center max-w-xl mx-auto mb-12">
          <h1 class="font-serif-brand text-4xl font-bold text-gray-900">Carrito de Compra</h1>
          <div class="w-12 h-1 bg-brand-pink mx-auto mt-2 rounded-full mb-4"></div>
          <p class="text-gray-500 text-xs md:text-sm">
            Estás a un paso de vestir la artesanía de Tekit. Revisa tu pedido y continúa con la compra segura.
          </p>
          @if (refreshingStock()) {
            <div class="mt-3 inline-flex items-center gap-2 text-xs font-medium text-brand-pink" aria-live="polite">
              <mat-icon class="text-base h-4 w-4 animate-spin">sync</mat-icon>
              Actualizando existencias...
            </div>
          }
        </div>

        @if (store.cart().length === 0) {
          <!-- Empty Cart View -->
          <div class="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[350px]">
            <div class="w-16 h-16 rounded-full bg-brand-light-pink flex items-center justify-center text-brand-pink mb-4">
              <mat-icon class="text-3xl">shopping_cart_checkout</mat-icon>
            </div>
            <h3 class="font-serif-brand text-2xl font-bold text-gray-900 mb-2">Tu carrito está vacío</h3>
            <p class="text-gray-500 text-sm md:text-base max-w-sm mb-6">
              Aún no has agregado ninguna de nuestras prendas artesanales. ¡Explora el catálogo y encuentra tu estilo yucateco!
            </p>
            <a routerLink="/catalogo" class="bg-brand-pink hover:bg-brand-dark text-white px-8 py-3 rounded-full text-sm font-semibold transition-all shadow-md hover:shadow-brand-pink/15">
              Explorar Colecciones
            </a>
          </div>
        } @else {
          <!-- Cart Layout -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <!-- List of items -->
            <div class="lg:col-span-2 space-y-4">
              @for (item of store.cart(); track item.variantId) {
                <div class="bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-6 relative">
                  <!-- Product Image -->
                  <div class="w-full sm:w-24 h-24 rounded-xl overflow-hidden bg-brand-cream border border-gray-50 self-center">
                    <img [src]="item.product.image" [alt]="item.product.name" class="w-full h-full object-cover" referrerpolicy="no-referrer" />
                  </div>

                  <!-- Details -->
                  <div class="flex-1 flex flex-col justify-between">
                    <div>
                      <div class="flex justify-between items-start">
                        <h3 class="font-serif-brand text-lg font-bold text-gray-900 pr-4 hover:text-brand-pink transition-colors">
                          <a [routerLink]="['/producto', item.product.id]">{{ item.product.name }}</a>
                        </h3>
                        <!-- Delete button -->
                        <button 
                          (click)="removeItem(item)" 
                          class="text-gray-400 hover:text-brand-pink transition-colors p-1"
                          title="Eliminar de carrito"
                        >
                          <mat-icon>delete_outline</mat-icon>
                        </button>
                      </div>

                      <!-- Configuration tags -->
                      <div class="flex flex-wrap gap-2 mt-1.5 mb-3">
                        <span class="bg-brand-cream text-gray-600 px-2.5 py-0.5 rounded-md text-[10px] font-medium border border-gray-100">
                          Talla: {{ item.selectedSize }}
                        </span>
                        <span class="bg-brand-cream text-gray-600 px-2.5 py-0.5 rounded-md text-[10px] font-medium border border-gray-100">
                          Color: {{ item.selectedColor }}
                        </span>
                        <span class="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-md text-[10px] font-semibold border border-emerald-100">
                          Disponibles: {{ getAvailableStock(item) }}
                        </span>
                      </div>
                    </div>

                    <!-- Quantity Adjust and Subtotal -->
                    <div class="flex items-center justify-between pt-2 border-t border-gray-50">
                      <!-- Selector -->
                      <div class="flex items-center bg-brand-cream rounded-lg p-1 border border-gray-50">
                        <button (click)="decreaseQty(item)" class="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-brand-pink transition-colors">
                          <mat-icon class="text-sm">remove</mat-icon>
                        </button>
                        <span class="font-bold text-gray-800 text-sm px-2">{{ item.quantity }}</span>
                        <button (click)="increaseQty(item)" class="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-brand-pink transition-colors">
                          <mat-icon class="text-sm">add</mat-icon>
                        </button>
                      </div>

                      <!-- Cost subtotal -->
                      <div class="text-right">
                        <span class="text-xs text-gray-400 block">Subtotal</span>
                        <span class="font-bold text-gray-900 text-base">
                          {{ '$' + (getItemPrice(item) * item.quantity) }} MXN
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              }

              <!-- Additional Action links -->
              <div class="flex justify-between items-center px-4">
                <a routerLink="/catalogo" class="text-sm text-brand-pink hover:text-brand-dark transition-colors font-semibold flex items-center gap-1">
                  <mat-icon class="text-sm">arrow_back</mat-icon> Seguir comprando
                </a>
                <button (click)="clearCart()" class="text-xs text-gray-400 hover:text-brand-pink font-semibold">
                  Vaciar carrito
                </button>
              </div>
            </div>

            <!-- Order Summary Sidebar -->
            <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm self-start">
              <h3 class="font-serif-brand text-xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">
                Resumen de Orden
              </h3>

              <div class="space-y-4 mb-6">
                <div class="flex justify-between text-sm text-gray-500">
                  <span>Productos ({{ store.cartTotalItems() }} piezas)</span>
                  <span class="font-medium text-gray-900">{{ '$' + store.cartTotalPrice() }} MXN</span>
                </div>
                <div class="flex justify-between text-sm text-gray-500">
                  <span>Envío (desde Tekit)</span>
                  <span class="font-semibold text-emerald-600">¡Gratis!</span>
                </div>
                <div class="flex justify-between text-sm text-gray-500 pb-4 border-b border-gray-100">
                  <span>Impuestos (IVA incl.)</span>
                  <span class="font-medium text-gray-900">$0.00</span>
                </div>
                <div class="flex justify-between text-base font-bold text-gray-900">
                  <span>Total Neto</span>
                  <span class="text-brand-pink text-lg">{{ '$' + store.cartTotalPrice() }} MXN</span>
                </div>
              </div>

              <!-- Checkout Actions -->
              <a 
                routerLink="/checkout" 
                class="w-full bg-brand-pink hover:bg-brand-dark text-white font-semibold rounded-xl h-12 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-brand-pink/15"
              >
                Proceder al Pago <mat-icon>payment</mat-icon>
              </a>

              <!-- Safe checkout lock badge -->
              <div class="flex items-center justify-center gap-1.5 mt-4 text-[10px] text-gray-400">
                <mat-icon class="text-sm h-4 w-4">lock</mat-icon> Transacciones encriptadas de alta seguridad
              </div>
            </div>
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
export class Carrito implements OnInit {
  readonly store = inject(Store);
  readonly refreshingStock = signal(false);
  private readonly seo = inject(Seo);

  async ngOnInit() {
    this.seo.setMetaTags(
      'Carrito de Compras',
      'Revisa las guayaberas, vestidos y blusas yucatecas en tu carrito de compras de Creaciones Golondrina y prepárate para finalizar tu pedido con envío seguro.',
      ['mi carrito', 'comprar ropa yucateca', 'guayaberas Tekit online']
    );

    // Entering the cart is a strong availability checkpoint. It must not be satisfied
    // by a catalog request that started on the previous page.
    this.refreshingStock.set(true);
    try {
      await this.store.refreshCatalogAndCart(true, true, true, true);
    } finally {
      this.refreshingStock.set(false);
    }
  }

  getAvailableStock(item: CartItem): number {
    return this.store.getVariant(item.product, item.selectedSize, item.selectedColor)?.availableBodega ?? 0;
  }

  getItemPrice(item: CartItem): number {
    return Number(item.unitPrice ?? this.store.getVariant(item.product, item.selectedSize, item.selectedColor)?.precio_ecommerce ?? item.product.precio_ecommerce ?? 0);
  }

  increaseQty(item: CartItem) {
    this.store.updateCartQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity + 1);
  }

  decreaseQty(item: CartItem) {
    this.store.updateCartQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity - 1);
  }

  removeItem(item: CartItem) {
    this.store.removeFromCart(item.product.id, item.selectedSize, item.selectedColor);
  }

  clearCart() {
    this.store.clearCart();
  }
}
