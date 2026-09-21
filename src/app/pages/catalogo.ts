import {ChangeDetectionStrategy, Component, inject, signal, computed, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router, RouterLink} from '@angular/router';
import {Store, Product} from '../components/store';
import {Seo} from '../components/seo';
import {MatIconModule} from '@angular/material/icon';
import {environment} from '../../environments/environment';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="py-12 bg-brand-cream animate-fade-in relative min-h-screen">
      <div class="container mx-auto px-4">
        <!-- Page Title -->
        <div class="text-center max-w-xl mx-auto mb-8">
          <span class="text-brand-pink font-semibold uppercase tracking-widest text-xs">Artesanía de Tekit</span>
          <h1 class="font-serif-brand text-3xl md:text-4xl font-bold text-gray-900 mt-1">Nuestro Catálogo</h1>
          <div class="w-12 h-1 bg-brand-pink mx-auto mt-2 rounded-full mb-4"></div>
          <p class="text-gray-600 text-sm md:text-base leading-relaxed">
            Explora nuestra selecta colección de ropa tradicional confeccionada con lino y algodón de primer nivel.
          </p>
        </div>

        <!-- Mobile & Tablet Filter Action Bar (Visible only on < lg screens) -->
        <div class="lg:hidden mb-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <!-- Filter Trigger Button -->
          <button 
            type="button"
            (click)="openMobileFilters()"
            class="flex items-center justify-center gap-2 bg-brand-pink hover:bg-brand-dark text-white px-4 py-3 rounded-xl text-sm font-semibold shadow-sm transition-all cursor-pointer"
          >
            <mat-icon class="text-lg">tune</mat-icon>
            <span>Filtros y Búsqueda</span>
            @if (activeFiltersCount() > 0) {
              <span class="bg-white text-brand-pink text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {{ activeFiltersCount() }}
              </span>
            }
          </button>

          <!-- Quick Results & Clear Count -->
          <div class="flex items-center justify-between sm:justify-end gap-3 text-xs text-gray-500 px-1">
            <span>
              <strong>{{ store.filteredProducts().length }}</strong> prendas encontradas
            </span>
            @if (activeFiltersCount() > 0) {
              <button 
                type="button"
                (click)="clearFilters()"
                class="text-brand-pink hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <mat-icon class="text-sm">restart_alt</mat-icon> Limpiar
              </button>
            }
          </div>
        </div>

        <!-- Active Filter Pills for Mobile/Tablet -->
        @if (activeFiltersCount() > 0) {
          <div class="lg:hidden flex flex-wrap gap-1.5 mb-6 items-center">
            <span class="text-xs text-gray-400 font-medium mr-1">Activos:</span>
            @if (store.searchQuery().trim() !== '') {
              <span class="inline-flex items-center gap-1 bg-white border border-gray-200 text-gray-800 text-xs px-2.5 py-1 rounded-lg">
                "{{ store.searchQuery() }}"
                <button type="button" (click)="store.searchQuery.set('')" class="text-gray-400 hover:text-red-500">
                  <mat-icon class="text-sm h-3.5 w-3.5">close</mat-icon>
                </button>
              </span>
            }
            @if (store.selectedCategory() !== 'Todos') {
              <span class="inline-flex items-center gap-1 bg-white border border-gray-200 text-gray-800 text-xs px-2.5 py-1 rounded-lg">
                {{ store.selectedCategory() }}
                <button type="button" (click)="store.selectedCategory.set('Todos')" class="text-gray-400 hover:text-red-500">
                  <mat-icon class="text-sm h-3.5 w-3.5">close</mat-icon>
                </button>
              </span>
            }
            @if (store.selectedSize() !== 'Todos') {
              <span class="inline-flex items-center gap-1 bg-white border border-gray-200 text-gray-800 text-xs px-2.5 py-1 rounded-lg">
                Talla: {{ store.selectedSize() }}
                <button type="button" (click)="store.selectedSize.set('Todos')" class="text-gray-400 hover:text-red-500">
                  <mat-icon class="text-sm h-3.5 w-3.5">close</mat-icon>
                </button>
              </span>
            }
            @if (store.selectedColor() !== 'Todos') {
              <span class="inline-flex items-center gap-1 bg-white border border-gray-200 text-gray-800 text-xs px-2.5 py-1 rounded-lg">
                Color: {{ store.selectedColor() }}
                <button type="button" (click)="store.selectedColor.set('Todos')" class="text-gray-400 hover:text-red-500">
                  <mat-icon class="text-sm h-3.5 w-3.5">close</mat-icon>
                </button>
              </span>
            }
            @if (store.selectedManga() !== 'Todos') {
              <span class="inline-flex items-center gap-1 bg-white border border-gray-200 text-gray-800 text-xs px-2.5 py-1 rounded-lg">
                Manga: {{ store.selectedManga() }}
                <button type="button" (click)="store.selectedManga.set('Todos')" class="text-gray-400 hover:text-red-500">
                  <mat-icon class="text-sm h-3.5 w-3.5">close</mat-icon>
                </button>
              </span>
            }
            @if (store.isPriceFilterActive()) {
              <span class="inline-flex items-center gap-1 bg-white border border-gray-200 text-gray-800 text-xs px-2.5 py-1 rounded-lg">
                Hasta {{ '$' + store.priceRange() }}
                <button type="button" (click)="store.resetPriceFilter()" class="text-gray-400 hover:text-red-500">
                  <mat-icon class="text-sm h-3.5 w-3.5">close</mat-icon>
                </button>
              </span>
            }
          </div>
        }

        <!-- Advanced Search and Filters Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <!-- Desktop Filter Sidebar (Permanent on Desktop 'lg:') -->
          <div class="hidden lg:block lg:col-span-1 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm self-start h-auto sticky top-24">
            <div class="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 select-none">
              <h3 class="font-serif-brand text-xl font-bold text-gray-900 flex items-center gap-2">
                <mat-icon class="text-brand-pink">filter_list</mat-icon> Filtros de Búsqueda
              </h3>
              @if (activeFiltersCount() > 0) {
                <button (click)="clearFilters()" class="text-xs text-brand-pink hover:underline font-medium transition-colors cursor-pointer">
                  Limpiar todo
                </button>
              }
            </div>

            <!-- Filters Content Desktop -->
            <div>
              <!-- Advanced Search Bar -->
              <div class="mb-6">
                <label for="search-input-desktop" class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Buscador Avanzado</label>
                <div class="relative">
                  <input 
                    id="search-input-desktop"
                    type="text" 
                    [value]="store.searchQuery()"
                    (input)="onSearchInput($event)"
                    placeholder="Ej: Lino, Presidencial..." 
                    class="w-full pl-10 pr-4 py-2.5 bg-brand-cream rounded-xl text-sm border border-transparent focus:border-brand-pink/30 focus:outline-none transition-all placeholder:text-gray-400"
                  />
                  <mat-icon class="absolute left-3.5 top-3 text-gray-400 text-lg">search</mat-icon>
                </div>
              </div>

              <!-- Categories are derived only from departments represented by products in the current response. -->
              @if (store.availableCategories().length > 1) {
                <div class="mb-6">
                  <span class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Para Quién</span>
                  <div class="flex flex-col gap-2">
                    @for (cat of store.availableCategories(); track cat) {
                      <button 
                        type="button"
                        (click)="store.setCategory(cat)"
                        [class]="store.selectedCategory() === cat ? 'bg-brand-pink text-white font-medium border-brand-pink shadow-xs' : 'bg-brand-cream text-gray-700 hover:bg-gray-100 border-transparent'"
                        class="w-full text-left px-4 py-2 rounded-xl text-xs border transition-all flex items-center justify-between cursor-pointer"
                      >
                        <span>{{ cat }}</span>
                        @if (store.selectedCategory() === cat) {
                          <mat-icon class="text-xs leading-none">check</mat-icon>
                        }
                      </button>
                    }
                  </div>
                </div>
              }

              <!-- Sizes Filter -->
              @if (store.availableSizes().length > 1) {
              <div class="mb-6">
                <span class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Tallas</span>
                <div class="grid grid-cols-3 gap-2">
                  @for (sz of store.availableSizes(); track sz) {
                    <button 
                      type="button"
                      (click)="store.selectedSize.set(sz)"
                      [class]="store.selectedSize() === sz ? 'bg-brand-pink text-white font-semibold shadow-xs' : 'bg-brand-cream text-gray-700 hover:bg-gray-100'"
                      class="py-2 rounded-lg text-xs transition-all border border-transparent text-center cursor-pointer"
                    >
                      {{ sz }}
                    </button>
                  }
                </div>
              </div>
              }

              <!-- Colors Filter -->
              @if (store.availableColors().length > 1) {
              <div class="mb-6">
                <span class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Colores</span>
                <div class="flex flex-wrap gap-2">
                  @for (col of store.availableColors(); track col) {
                    <button 
                      type="button"
                      (click)="store.selectedColor.set(col)"
                      [class]="store.selectedColor() === col ? 'bg-brand-pink text-white font-semibold shadow-xs' : 'bg-brand-cream text-gray-700 hover:bg-gray-100'"
                      class="px-3 py-1.5 rounded-lg text-xs transition-all border border-transparent cursor-pointer"
                    >
                      {{ col }}
                    </button>
                  }
                </div>
              </div>
              }

              <!-- Mangas Filter -->
              @if (store.availableMangas().length > 1) {
                <div class="mb-6">
                  <span class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Mangas</span>
                  <div class="flex flex-wrap gap-2">
                    @for (mga of store.availableMangas(); track mga) {
                      <button 
                        type="button"
                        (click)="store.selectedManga.set(mga)"
                        [class]="store.selectedManga() === mga ? 'bg-brand-pink text-white font-semibold shadow-xs' : 'bg-brand-cream text-gray-700 hover:bg-gray-100'"
                        class="px-3 py-1.5 rounded-lg text-xs transition-all border border-transparent cursor-pointer"
                      >
                        {{ mga }}
                      </button>
                    }
                  </div>
                </div>
              }

              <!-- Price range is calculated from ecommerce prices present in the current product response. -->
              @if (store.hasDynamicPriceRange()) {
                <div>
                  <div class="flex justify-between items-center mb-2">
                    <label for="price-range-desktop" class="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Precio Máximo</label>
                    <span class="text-xs font-bold text-brand-pink">{{ '$' + store.priceRange() }} MXN</span>
                  </div>
                  <input 
                    id="price-range-desktop"
                    type="range"
                    [min]="store.minAvailablePrice()"
                    [max]="store.maxAvailablePrice()"
                    [step]="store.priceStep()"
                    [value]="store.priceRange()"
                    (input)="onPriceChange($event)"
                    class="w-full accent-brand-pink cursor-pointer bg-gray-200 rounded-lg h-1"
                  />
                  <div class="flex justify-between text-[10px] text-gray-400 mt-1">
                    <span>{{ '$' + store.minAvailablePrice() }}</span>
                    <span>{{ '$' + store.maxAvailablePrice() }}</span>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Product Grid Area -->
          <div class="lg:col-span-3">
            <!-- Search Results metadata on Desktop -->
            <div class="hidden lg:flex items-center justify-between mb-6 bg-white px-6 py-4 rounded-2xl border border-gray-100 shadow-sm text-sm">
              <span class="text-gray-500">
                Mostrando <strong class="text-gray-900">{{ store.filteredProducts().length }}</strong> prendas típicas
              </span>
              <div class="text-xs text-gray-400">
                Hecho a mano en Tekit, Yucatán
              </div>
            </div>

            <!-- Grid -->
            @if (store.catalogLoading()) {
              <div class="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm min-h-96 flex flex-col items-center justify-center">
                <mat-icon class="text-brand-pink text-4xl h-10 w-10 animate-spin mb-4">sync</mat-icon>
                <h3 class="font-serif-brand text-2xl font-bold text-gray-900 mb-2">Cargando catálogo</h3>
                <p class="text-gray-500 text-sm">Consultando existencias y precios vigentes en GuayaFlow.</p>
              </div>
            } @else if (store.catalogError()) {
              <div class="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm min-h-96 flex flex-col items-center justify-center">
                <mat-icon class="text-rose-500 text-4xl h-10 w-10 mb-4">cloud_off</mat-icon>
                <h3 class="font-serif-brand text-2xl font-bold text-gray-900 mb-2">Catálogo no disponible</h3>
                <p class="text-gray-500 max-w-md text-sm">{{ store.catalogError() }} No mostraremos inventario ni precios ficticios.</p>
              </div>
            } @else if (store.filteredProducts().length === 0) {
              <div class="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm flex flex-col items-center justify-center min-h-96">
                <div class="w-16 h-16 rounded-full bg-brand-light-pink flex items-center justify-center text-brand-pink mb-4">
                  <mat-icon class="text-3xl">sentiment_very_dissatisfied</mat-icon>
                </div>
                <h3 class="font-serif-brand text-2xl font-bold text-gray-900 mb-2">No encontramos prendas</h3>
                <p class="text-gray-500 max-w-sm mb-6 text-sm md:text-base">
                  Prueba modificando los filtros de búsqueda o el buscador avanzado para encontrar la prenda típica ideal.
                </p>
                <button (click)="clearFilters()" class="bg-brand-pink text-white px-6 py-2.5 rounded-full text-xs font-medium hover:bg-brand-dark transition-all cursor-pointer">
                  Restablecer Filtros
                </button>
              </div>
            } @else {
              <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6">
                @for (product of store.filteredProducts(); track product.id) {
                  <div class="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative">
                    <!-- Wishlist toggle -->
                    <button 
                      type="button"
                      (click)="toggleWishlist(product.id); $event.stopPropagation()" 
                      class="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-gray-400 hover:text-brand-pink shadow-sm transition-all cursor-pointer"
                      title="Guardar en favoritos"
                    >
                      <mat-icon [class.text-brand-pink]="store.isInWishlist(product.id)" class="text-base sm:text-lg">
                        {{ store.isInWishlist(product.id) ? 'favorite' : 'favorite_border' }}
                      </mat-icon>
                    </button>

                    <!-- Product Image (Clickable to detail) -->
                    <a 
                      [routerLink]="['/producto', product.id]" 
                      class="h-48 sm:h-64 overflow-hidden bg-brand-cream relative block cursor-pointer"
                      title="Ver detalle de {{ product.name }}"
                    >
                      <img 
                        [src]="product.image" 
                        [alt]="product.name" 
                        class="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" 
                        referrerpolicy="no-referrer"
                      />
                      @if (product.isOffer) {
                        <span class="absolute top-3 left-3 sm:top-4 sm:left-4 bg-brand-pink text-white px-2 sm:px-2.5 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-bold rounded-full uppercase tracking-wider shadow-xs">
                          Oferta
                        </span>
                      }
                    </a>

                    <!-- Details -->
                    <div class="p-3.5 sm:p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <!-- Category and Type badges -->
                        <div class="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-400 mb-1.5 sm:mb-2">
                          <span>{{ product.category }}</span>
                          <span class="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <span>{{ product.type }}</span>
                        </div>

                        <a 
                          [routerLink]="['/producto', product.id]" 
                          class="block focus:outline-none cursor-pointer"
                          title="Ver detalle de {{ product.name }}"
                        >
                          <h3 class="font-serif-brand font-bold text-sm sm:text-base lg:text-lg text-gray-900 group-hover:text-brand-pink transition-colors leading-snug mb-1 line-clamp-1">
                            {{ product.name }}
                          </h3>
                        </a>

                        <p class="text-[11px] sm:text-xs text-gray-500 line-clamp-2 mb-2 sm:mb-3">
                          {{ product.description }}
                        </p>

                        <!-- Rating -->
                        <div class="flex items-center gap-1 mb-3">
                          <mat-icon class="text-brand-yellow text-sm sm:text-base h-3.5 sm:h-4 w-3.5 sm:w-4">star</mat-icon>
                          <span class="text-[11px] sm:text-xs font-bold text-gray-700">{{ product.rating }}</span>
                          <span class="text-[9px] sm:text-[10px] text-gray-400">({{ product.reviewsCount }})</span>
                        </div>
                      </div>

                      <!-- Footer/CTA Area -->
                      <div class="pt-3 sm:pt-4 border-t border-gray-50 flex items-end justify-between gap-1.5 sm:gap-2">
                        <!-- Prices -->
                        <div class="flex flex-col">
                          @if (product.price > 0) {
                            @if (product.isOffer && product.offerPrice) {
                              <span class="text-sm sm:text-lg font-bold text-brand-pink">{{ '$' + product.offerPrice }}</span>
                              <span class="text-[10px] sm:text-xs text-gray-400 line-through">{{ '$' + product.price }}</span>
                            } @else {
                              <span class="text-sm sm:text-lg font-bold text-gray-900">{{ '$' + product.price }} MXN</span>
                            }
                          } @else {
                            <span class="text-[10px] sm:text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-1.5 sm:px-2 py-0.5 rounded-md inline-block w-fit leading-none">
                              Precio por consultar
                            </span>
                            <span class="text-[9px] sm:text-[10px] text-gray-500 mt-0.5 leading-tight">Por WhatsApp</span>
                          }
                        </div>

                        <!-- Add / View actions -->
                        <div class="flex flex-col items-end gap-1.5 sm:gap-2">
                          <!-- Colores Disponibles -->
                          @if (product.colorList && product.colorList.length > 0) {
                            <div class="flex gap-1 items-center" title="Colores disponibles">
                              @for (col of product.colorList.slice(0, 4); track col.name) {
                                <span 
                                  class="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full border border-gray-200 block shadow-xs transition-transform hover:scale-115"
                                  [style.backgroundColor]="col.hex"
                                  [title]="col.name"
                                ></span>
                              }
                            </div>
                          }
                          <div class="flex items-center gap-1">
                            @if (product.price === 0) {
                              <a
                                [href]="getWhatsAppUrl(product)"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="bg-[#25D366] hover:bg-[#1EBE5D] text-white px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-semibold transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                                title="Consultar precio por WhatsApp"
                              >
                                <svg class="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" viewBox="0 0 24 24">
                                  <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.335 4.975L2 22l5.13-1.347a9.957 9.957 0 0 0 4.88 1.285h.005c5.507 0 9.99-4.474 9.992-9.986a9.94 9.94 0 0 0-2.927-7.064A9.925 9.925 0 0 0 12.012 2zm5.72 14.102c-.252.712-1.461 1.305-2.012 1.392-.5.08-1.15.117-1.826-.1-.415-.133-.925-.327-1.575-.61-2.766-1.202-4.546-4.005-4.683-4.192-.136-.188-1.114-1.485-1.114-2.833 0-1.348.705-2.012.956-2.28.252-.268.553-.335.737-.335.184 0 .368.002.528.01.163.007.385-.062.602.46.225.54.77 1.88.836 2.016.066.134.11.29.02.47-.09.18-.135.3-.27.456-.136.156-.285.35-.407.47-.136.133-.277.278-.12.548.156.268.692 1.13 1.486 1.834.1.088.196.173.29.253.945.812 1.69 1.054 1.93.125.133.155-.022.355-.135.49-.112.134-.495.58-.63.782-.134.202-.27.402.002.553.27.153 1.714.846 2.115 1.05.4.202.668.298.766.14.098-.157.4-.403.548-.56.148-.158.29-.134.49-.06.202.072 1.28.605 1.503.71.224.11.373.16.428.25.056.1.056.578-.196 1.29z"/>
                                </svg>
                                Preguntar
                              </a>
                            } @else {
                              <button 
                                type="button"
                                (click)="addToCartDefault(product)"
                                class="bg-brand-pink hover:bg-brand-dark text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <mat-icon class="text-sm sm:text-base h-3.5 sm:h-4 w-3.5 sm:w-4">visibility</mat-icon> Ver
                              </button>
                            }                            
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Off-Canvas Collapsible Sidebar for Tablets and Mobile (Slide-over drawer) -->
      @if (mobileSidebarOpen()) {
        <!-- Backdrop Overlay -->
        <div 
          (click)="closeMobileFilters()"
          (keydown.enter)="closeMobileFilters()"
          (keydown.escape)="closeMobileFilters()"
          role="button"
          tabindex="0"
          aria-label="Cerrar filtros"
          class="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 transition-opacity duration-300 lg:hidden cursor-pointer focus:outline-none"
        ></div>

        <!-- Sliding Sidebar Drawer -->
        <div 
          class="fixed inset-y-0 left-0 max-w-sm w-full bg-white z-50 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out lg:hidden"
        >
          <!-- Drawer Header -->
          <div class="p-5 border-b border-gray-100 flex items-center justify-between bg-brand-cream/50">
            <div class="flex items-center gap-2">
              <mat-icon class="text-brand-pink">tune</mat-icon>
              <div>
                <h3 class="font-serif-brand text-lg font-bold text-gray-900">Filtros de Búsqueda</h3>
                <span class="text-[11px] text-gray-500">
                  {{ store.filteredProducts().length }} prendas disponibles
                </span>
              </div>
            </div>
            <button 
              type="button"
              (click)="closeMobileFilters()"
              class="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
              title="Cerrar filtros"
            >
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <!-- Drawer Body (Scrollable filters) -->
          <div class="p-5 flex-1 overflow-y-auto space-y-6">
            <!-- Advanced Search Bar -->
            <div>
              <label for="search-input-mobile" class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Buscador Avanzado</label>
              <div class="relative">
                <input 
                  id="search-input-mobile"
                  type="text" 
                  [value]="store.searchQuery()"
                  (input)="onSearchInput($event)"
                  placeholder="Ej: Lino, Presidencial..." 
                  class="w-full pl-10 pr-4 py-2.5 bg-brand-cream rounded-xl text-sm border border-transparent focus:border-brand-pink/30 focus:outline-none transition-all placeholder:text-gray-400"
                />
                <mat-icon class="absolute left-3.5 top-3 text-gray-400 text-lg">search</mat-icon>
              </div>
            </div>

            <!-- Category Filter -->
            @if (store.availableCategories().length > 1) {
              <div>
                <span class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Para Quién</span>
                <div class="grid grid-cols-2 gap-2">
                  @for (cat of store.availableCategories(); track cat) {
                    <button 
                      type="button"
                      (click)="store.setCategory(cat)"
                      [class]="store.selectedCategory() === cat ? 'bg-brand-pink text-white font-medium border-brand-pink shadow-xs' : 'bg-brand-cream text-gray-700 hover:bg-gray-100 border-transparent'"
                      class="px-3 py-2 rounded-xl text-xs border transition-all flex items-center justify-between cursor-pointer"
                    >
                      <span>{{ cat }}</span>
                      @if (store.selectedCategory() === cat) {
                        <mat-icon class="text-xs leading-none">check</mat-icon>
                      }
                    </button>
                  }
                </div>
              </div>
            }

            <!-- Sizes Filter -->
            @if (store.availableSizes().length > 1) {
            <div>
              <span class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Tallas</span>
              <div class="grid grid-cols-4 gap-2">
                @for (sz of store.availableSizes(); track sz) {
                  <button 
                    type="button"
                    (click)="store.selectedSize.set(sz)"
                    [class]="store.selectedSize() === sz ? 'bg-brand-pink text-white font-semibold shadow-xs' : 'bg-brand-cream text-gray-700 hover:bg-gray-100'"
                    class="py-2 rounded-lg text-xs transition-all border border-transparent text-center cursor-pointer"
                  >
                    {{ sz }}
                  </button>
                }
              </div>
            </div>
            }

            <!-- Colors Filter -->
            @if (store.availableColors().length > 1) {
            <div>
              <span class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Colores</span>
              <div class="flex flex-wrap gap-2">
                @for (col of store.availableColors(); track col) {
                  <button 
                    type="button"
                    (click)="store.selectedColor.set(col)"
                    [class]="store.selectedColor() === col ? 'bg-brand-pink text-white font-semibold shadow-xs' : 'bg-brand-cream text-gray-700 hover:bg-gray-100'"
                    class="px-3 py-1.5 rounded-lg text-xs transition-all border border-transparent cursor-pointer"
                  >
                    {{ col }}
                  </button>
                }
              </div>
            </div>
            }

            <!-- Mangas Filter -->
            @if (store.availableMangas().length > 1) {
              <div>
                <span class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Mangas</span>
                <div class="flex flex-wrap gap-2">
                  @for (mga of store.availableMangas(); track mga) {
                    <button 
                      type="button"
                      (click)="store.selectedManga.set(mga)"
                      [class]="store.selectedManga() === mga ? 'bg-brand-pink text-white font-semibold shadow-xs' : 'bg-brand-cream text-gray-700 hover:bg-gray-100'"
                      class="px-3 py-1.5 rounded-lg text-xs transition-all border border-transparent cursor-pointer"
                    >
                      {{ mga }}
                    </button>
                  }
                </div>
              </div>
            }

            <!-- Price Slider -->
            @if (store.hasDynamicPriceRange()) {
              <div>
                <div class="flex justify-between items-center mb-2">
                  <label for="price-range-mobile" class="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Precio Máximo</label>
                  <span class="text-xs font-bold text-brand-pink">{{ '$' + store.priceRange() }} MXN</span>
                </div>
                <input 
                  id="price-range-mobile"
                  type="range"
                  [min]="store.minAvailablePrice()"
                  [max]="store.maxAvailablePrice()"
                  [step]="store.priceStep()"
                  [value]="store.priceRange()"
                  (input)="onPriceChange($event)"
                  class="w-full accent-brand-pink cursor-pointer bg-gray-200 rounded-lg h-1"
                />
                <div class="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>{{ '$' + store.minAvailablePrice() }}</span>
                  <span>{{ '$' + store.maxAvailablePrice() }}</span>
                </div>
              </div>
            }

            <!-- Action Buttons right after filter options -->
            <div class="pt-4 border-t border-gray-100 flex items-center gap-3">
              @if (activeFiltersCount() > 0) {
                <button 
                  type="button"
                  (click)="clearFilters()"
                  class="px-4 py-3 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Limpiar
                </button>
              }
              <button 
                type="button"
                (click)="closeMobileFilters()"
                class="flex-1 bg-brand-pink hover:bg-brand-dark text-white py-3 rounded-xl text-sm font-semibold shadow-sm transition-all text-center cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Ver {{ store.filteredProducts().length }} prendas</span>
                <mat-icon class="text-base">arrow_forward</mat-icon>
              </button>
            </div>
          </div>
        </div>
      }
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
    .line-clamp-1 {
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;  
      overflow: hidden;
    }
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;  
      overflow: hidden;
    }
  `
})
export class Catalogo implements OnInit {
  readonly store = inject(Store);
  private readonly seo = inject(Seo);
  private readonly router = inject(Router);
  readonly mobileSidebarOpen = signal<boolean>(false);

  readonly activeFiltersCount = computed(() => {
    let count = 0;
    if (this.store.searchQuery().trim() !== '') count++;
    if (this.store.selectedCategory() !== 'Todos') count++;
    if (this.store.selectedSize() !== 'Todos') count++;
    if (this.store.selectedColor() !== 'Todos') count++;
    if (this.store.selectedManga() !== 'Todos') count++;
    if (this.store.isPriceFilterActive()) count++;
    return count;
  });

  openMobileFilters() {
    this.mobileSidebarOpen.set(true);
  }

  closeMobileFilters() {
    this.mobileSidebarOpen.set(false);
  }

  ngOnInit() {
    // Commercial navigation checkpoint: categories, filters, prices and stock come
    // from a fresh /productos/ecommerce snapshot whenever Catalog opens.
    void this.store.loadProducts(true, true);

    this.seo.setMetaTags(
      'Catálogo de Ropa Tradicional',
      'Explora el catálogo de Creaciones Golondrina: guayaberas de lino para caballeros, hermosos vestidos tradicionales para damas y blusas bordadas infantiles. Confeccionadas con calidad premium en Tekit, Yucatán.',
      ['catalogo guayaberas', 'ropa de lino', 'huipiles yucatecos', 'guayaberas infantiles', 'Tekit Yucatan']
    );
  }

  onSearchInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.store.searchQuery.set(value);
  }

  onPriceChange(event: Event) {
    const value = +(event.target as HTMLInputElement).value;
    const min = this.store.minAvailablePrice();
    const max = this.store.maxAvailablePrice();
    this.store.priceRange.set(Math.min(max, Math.max(min, value)));
  }

  clearFilters() {
    this.store.resetFilters();
  }

  toggleWishlist(id: string) {
    this.store.toggleWishlist(id);
  }

  addToCartDefault(product: Product) {
    this.router.navigate(['/producto', product.id]);
  }

  getWhatsAppUrl(product: Product): string {
    const text = encodeURIComponent(
      `Hola, me gustaría consultar el precio y disponibilidad de la prenda "${product.name}" (Ref: ${product.ref_code || product.id}) de Creaciones Golondrina.`
    );
    return `https://wa.me/${environment.whatsappNumber}?text=${text}`;
  }
}
