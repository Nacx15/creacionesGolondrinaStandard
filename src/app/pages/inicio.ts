import {ChangeDetectionStrategy, Component, inject, signal, computed, OnInit, OnDestroy} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router, RouterLink} from '@angular/router';
import {Store} from '../components/store';
import {Seo} from '../components/seo';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Hero Section with Custom Generated Boutique Banner -->
    <section class="relative bg-brand-dark text-white overflow-hidden py-24 md:py-32">
      <div class="absolute inset-0 bg-black/60 z-10"></div>
      <div class="absolute inset-0 z-0">
        <img 
          src="https://assets.sm-panel.site/gallery/creacionesgolondrina/tienda_frente.jpeg" 
          alt="Boutique Creaciones Golondrina en Tekit" 
          class="w-full h-full object-cover"
          referrerpolicy="no-referrer"
        />
      </div>
      <div class="container mx-auto px-4 relative z-20 flex flex-col items-center text-center">
        <span class="text-brand-yellow font-semibold tracking-wider uppercase text-sm mb-3">Artesanía de Tekit, Yucatán</span>
        <h1 class="font-serif-brand text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight leading-tight">
          Elegancia, Tradición y <br class="hidden md:inline" /> Costura Yucateca
        </h1>
        <p class="text-lg md:text-xl text-gray-200 max-w-2xl mb-8 leading-relaxed">
          Guayaberas presidenciales de lino fino, vestidos huipil bordados de gala y blusas típicas confeccionadas por la maestra artesana Martha María Puc Loeza.
        </p>
        <div class="flex flex-col sm:flex-row gap-4">
          <a routerLink="/catalogo" class="bg-brand-pink text-white px-8 py-3.5 rounded-full font-medium hover:bg-opacity-95 transition-all text-center shadow-lg hover:shadow-brand-pink/20 flex items-center justify-center gap-2">
            Ver Catálogo <mat-icon class="text-base leading-none">arrow_forward</mat-icon>
          </a>
          <a routerLink="/nosotros" class="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-3.5 rounded-full font-medium hover:bg-white/20 transition-all text-center">
            Conoce Nuestra Historia
          </a>
        </div>
      </div>
    </section>

    <!-- Interactive Promo / Offers & Reviews Carousel -->
    <section class="py-16 bg-white border-b border-gray-100">
      <div class="container mx-auto px-4">
        <div class="text-center mb-10">
          <h2 class="font-serif-brand text-3xl md:text-4xl font-bold text-gray-900">Ofertas y Reseñas Especiales</h2>
          <div class="w-16 h-1 bg-brand-pink mx-auto mt-3 rounded-full"></div>
        </div>

        <div class="relative max-w-4xl mx-auto bg-brand-cream border border-brand-pink/10 rounded-2xl p-6 md:p-10 shadow-sm overflow-hidden">
          <!-- Slide Content -->
          <div class="transition-all duration-500 ease-in-out">
            @if (activeSlide() === 0 && promoProduct(); as promo) {
              <!-- Promo Slide 1 -->
              <div class="flex flex-col md:flex-row items-center gap-8 animate-fade-in">
                <div class="w-full md:w-1/2">
                  <div class="relative overflow-hidden rounded-xl bg-white p-4 flex justify-center">
                    <img [src]="promo.image" alt="Guayabera de Lino" class="h-64 object-cover rounded-lg" referrerpolicy="no-referrer">
                    <span class="absolute top-4 left-4 bg-brand-pink text-white px-3 py-1 text-xs font-bold rounded-full uppercase tracking-widest">
                      Oferta Especial
                    </span>
                  </div>
                </div>
                <div class="w-full md:w-1/2 flex flex-col justify-center">
                  <span class="text-brand-pink font-semibold text-sm uppercase tracking-wider">Prenda Destacada</span>
                  <h3 class="font-serif-brand text-2xl md:text-3xl font-bold text-gray-900 mt-1 mb-3">{{ promo.name }}</h3>
                  <p class="text-gray-600 mb-4 text-sm md:text-base leading-relaxed">{{ promo.description }}</p>
                  <div class="flex items-center gap-3 mb-6">
                    <!-- <span class="text-3xl font-bold text-brand-pink">{{ '$' + promo.offerPrice }} MXN</span> -->
                    <span class="text-3xl font-bold text-brand-pink">{{ '$' + promo.price }} MXN</span>
                    <span class="text-lg text-gray-400 line-through">{{ '$' + promo.price }} MXN</span>
                  </div>
                  <button (click)="buyPromo()" class="w-full sm:w-auto bg-brand-dark text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-pink transition-all flex items-center justify-center gap-2 shadow-sm">
                    <mat-icon>shopping_bag</mat-icon> Aprovechar Oferta
                  </button>
                </div>
              </div>
            } @else if (activeSlide() === 1) {
              <!-- Review Slide 1 -->
              <div class="flex flex-col items-center text-center py-6 animate-fade-in">
                <div class="flex gap-1 text-brand-yellow mb-4">
                  <mat-icon class="text-3xl h-8 w-8">star</mat-icon>
                  <mat-icon class="text-3xl h-8 w-8">star</mat-icon>
                  <mat-icon class="text-3xl h-8 w-8">star</mat-icon>
                  <mat-icon class="text-3xl h-8 w-8">star</mat-icon>
                  <mat-icon class="text-3xl h-8 w-8">star</mat-icon>
                </div>
                <p class="font-serif-brand text-xl md:text-2xl italic text-gray-800 max-w-2xl mb-6 leading-relaxed">
                  "La guayabera presidencial que adquirí superó todas mis expectativas. El lino es de primera clase y la confección artesanal de Tekit se nota en cada puntada. Martha María tiene manos mágicas."
                </p>
                <div class="flex flex-col items-center">
                  <span class="font-semibold text-gray-900 text-lg">Dr. Carlos Medina</span>
                  <span class="text-xs text-gray-500 uppercase tracking-widest mt-1">Cliente de Mérida, Yucatán</span>
                </div>
              </div>
            } @else {
              <!-- Review Slide 2 -->
              <div class="flex flex-col items-center text-center py-6 animate-fade-in">
                <div class="flex gap-1 text-brand-yellow mb-4">
                  <mat-icon class="text-3xl h-8 w-8">star</mat-icon>
                  <mat-icon class="text-3xl h-8 w-8">star</mat-icon>
                  <mat-icon class="text-3xl h-8 w-8">star</mat-icon>
                  <mat-icon class="text-3xl h-8 w-8">star</mat-icon>
                  <mat-icon class="text-3xl h-8 w-8">star</mat-icon>
                </div>
                <p class="font-serif-brand text-xl md:text-2xl italic text-gray-800 max-w-2xl mb-6 leading-relaxed">
                  "El vestido Huipil de gala para mi hija de 6 años es simplemente una obra de arte. La suavidad del algodón es ideal para el calor y el bordado de flores es hermoso. Mil gracias a Creaciones Golondrina."
                </p>
                <div class="flex flex-col items-center">
                  <span class="font-semibold text-gray-900 text-lg">Patricia Cardeña</span>
                  <span class="text-xs text-gray-500 uppercase tracking-widest mt-1">Cliente de Tekit, Yucatán</span>
                </div>
              </div>
            }
          </div>

          <!-- Carousel Indicators & Arrows -->
          <div class="flex items-center justify-between mt-8 pt-4 border-t border-gray-100">
            <button (click)="prevSlide()" class="p-2 text-gray-500 hover:text-brand-pink transition-colors">
              <mat-icon>chevron_left</mat-icon>
            </button>
            <div class="flex gap-2">
              <button (click)="setSlide(0)" [class]="activeSlide() === 0 ? 'bg-brand-pink w-6' : 'bg-gray-300 w-2'" class="h-2 rounded-full transition-all duration-300" aria-label="Ver oferta especial"></button>
              <button (click)="setSlide(1)" [class]="activeSlide() === 1 ? 'bg-brand-pink w-6' : 'bg-gray-300 w-2'" class="h-2 rounded-full transition-all duration-300" aria-label="Ver opinión de Carlos Medina"></button>
              <button (click)="setSlide(2)" [class]="activeSlide() === 2 ? 'bg-brand-pink w-6' : 'bg-gray-300 w-2'" class="h-2 rounded-full transition-all duration-300" aria-label="Ver opinión de Patricia Cardeña"></button>
            </div>
            <button (click)="nextSlide()" class="p-2 text-gray-500 hover:text-brand-pink transition-colors">
              <mat-icon>chevron_right</mat-icon>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Categories / Secciones Destacadas -->
    @if (homeCategories().length > 0) {
      <section class="py-16 bg-brand-cream">
        <div class="container mx-auto px-4">
          <div class="text-center mb-12">
            <span class="text-brand-pink font-semibold uppercase tracking-widest text-xs">Colecciones</span>
            <h2 class="font-serif-brand text-3xl md:text-4xl font-bold text-gray-900 mt-2">Nuestras Categorías de Vestir</h2>
            <div class="w-16 h-1 bg-brand-yellow mx-auto mt-3 rounded-full"></div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            @for (category of homeCategories(); track category.key) {
              <div class="group relative overflow-hidden rounded-2xl shadow-sm bg-white border border-gray-100 flex flex-col h-96 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <div class="h-2/3 overflow-hidden relative">
                  <img
                    [src]="category.image"
                    [alt]="category.alt"
                    class="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                    referrerpolicy="no-referrer"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>
                <div class="p-6 flex-1 flex flex-col justify-between bg-white relative z-10">
                  <div>
                    <h3 class="font-serif-brand text-xl font-bold text-gray-900">{{ category.name }}</h3>
                    <p class="text-sm text-gray-500 mt-1">{{ category.description }}</p>
                  </div>
                  <button
                    type="button"
                    (click)="goToCategory(category.name)"
                    class="text-brand-pink font-semibold text-sm hover:text-brand-dark transition-colors flex items-center gap-1 self-start"
                  >
                    Explorar colección <mat-icon class="text-sm">arrow_forward</mat-icon>
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      </section>
    }

    <!-- Why Us / Ventajas de comprar con nosotros -->
    <section class="py-16 bg-white">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div class="flex flex-col items-center text-center p-4">
            <div class="w-16 h-16 rounded-full bg-brand-light-pink flex items-center justify-center text-brand-pink mb-4">
              <mat-icon class="text-3xl">verified</mat-icon>
            </div>
            <h4 class="font-serif-brand text-lg font-bold text-gray-900 mb-2">100% Hecho en Tekit</h4>
            <p class="text-sm text-gray-600">Tekit es la Capital de la Guayabera. Todas nuestras prendas son confeccionadas localmente.</p>
          </div>
          <div class="flex flex-col items-center text-center p-4">
            <div class="w-16 h-16 rounded-full bg-brand-light-pink flex items-center justify-center text-brand-pink mb-4">
              <mat-icon class="text-3xl">brush</mat-icon>
            </div>
            <h4 class="font-serif-brand text-lg font-bold text-gray-900 mb-2">Bordados Artesanales</h4>
            <p class="text-sm text-gray-600">Diseños bordados con precisión que representan el alma yucateca y sus flores típicas.</p>
          </div>
          <div class="flex flex-col items-center text-center p-4">
            <div class="w-16 h-16 rounded-full bg-brand-light-pink flex items-center justify-center text-brand-pink mb-4">
              <mat-icon class="text-3xl">dry_cleaning</mat-icon>
            </div>
            <h4 class="font-serif-brand text-lg font-bold text-gray-900 mb-2">Fibras Naturales</h4>
            <p class="text-sm text-gray-600">Utilizamos lino fino premium y algodón de alta gama para asegurar máxima frescura.</p>
          </div>
          <div class="flex flex-col items-center text-center p-4">
            <div class="w-16 h-16 rounded-full bg-brand-light-pink flex items-center justify-center text-brand-pink mb-4">
              <mat-icon class="text-3xl">local_shipping</mat-icon>
            </div>
            <h4 class="font-serif-brand text-lg font-bold text-gray-900 mb-2">Envíos Seguros</h4>
            <p class="text-sm text-gray-600">Enviamos con embalaje cuidadoso a todo México directamente desde nuestro taller.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Google Maps & Contact Section -->
    <section class="py-16 bg-brand-cream border-t border-gray-100">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <!-- Information & Contact details -->
          <div>
            <span class="text-brand-pink font-semibold uppercase tracking-widest text-xs">Ubicación y Contacto</span>
            <h2 class="font-serif-brand text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-6">Visítanos en Tekit, Yucatán</h2>
            <p class="text-gray-600 mb-8 leading-relaxed">
              Nuestro taller y boutique física se encuentra en el corazón de Tekit, el municipio de mayor tradición guayaberera de todo Yucatán. Estaremos encantados de atenderte personalmente para tomar tus medidas o mostrarte nuestro catálogo completo de linos y bordados.
            </p>

            <div class="space-y-4 mb-8">
              <div class="flex items-start gap-4">
                <div class="p-2 rounded-lg bg-white text-brand-pink shadow-sm">
                  <mat-icon>place</mat-icon>
                </div>
                <div>
                  <h5 class="font-semibold text-gray-900">Dirección</h5>
                  <p class="text-sm text-gray-600">C 31 x 18 y 20 col San Rafael, Tekit, Yucatán, CP 97680</p>
                </div>
              </div>

              <div class="flex items-start gap-4">
                <div class="p-2 rounded-lg bg-white text-brand-pink shadow-sm">
                  <mat-icon>schedule</mat-icon>
                </div>
                <div>
                  <h5 class="font-semibold text-gray-900">Horarios de Atención</h5>
                  <p class="text-sm text-gray-600">Lunes a Viernes: 10:00 am - 5:00 pm</p>
                  <p class="text-sm text-gray-600">Sábado y Domingo: 9:00 am - 6:00 pm</p>
                </div>
              </div>

              <div class="flex items-start gap-4">
                <div class="p-2 rounded-lg bg-white text-brand-pink shadow-sm">
                  <mat-icon>phone</mat-icon>
                </div>
                <div>
                  <h5 class="font-semibold text-gray-900">Teléfonos de Contacto</h5>
                  <p class="text-sm text-gray-600">997 114 1825 | 997 135 6556</p>
                </div>
              </div>

              <div class="flex items-start gap-4">
                <div class="p-2 rounded-lg bg-white text-brand-pink shadow-sm">
                  <mat-icon>email</mat-icon>
                </div>
                <div>
                  <h5 class="font-semibold text-gray-900">Correo Electrónico</h5>
                  <p class="text-sm text-gray-600">creacionesgolondrina54&#64;gmail.com</p>
                </div>
              </div>
            </div>

            <!-- WhatsApp CTA -->
            <div class="flex flex-col sm:flex-row gap-4">
              <a href="https://wa.me/529971141825?text=Hola,%20me%20gustaría%20obtener%20información%20sobre%20sus%20guayaberas%20y%20vestidos" target="_blank" class="bg-[#25D366] text-white px-6 py-3.5 rounded-full font-medium hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 shadow-md">
                <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.335 4.975L2 22l5.13-1.347a9.957 9.957 0 0 0 4.88 1.285h.005c5.507 0 9.99-4.474 9.992-9.986a9.94 9.94 0 0 0-2.927-7.064A9.925 9.925 0 0 0 12.012 2zm5.72 14.102c-.252.712-1.461 1.305-2.012 1.392-.5.08-1.15.117-1.826-.1-.415-.133-.925-.327-1.575-.61-2.766-1.202-4.546-4.005-4.683-4.192-.136-.188-1.114-1.485-1.114-2.833 0-1.348.705-2.012.956-2.28.252-.268.553-.335.737-.335.184 0 .368.002.528.01.163.007.385-.062.602.46.225.54.77 1.88.836 2.016.066.134.11.29.02.47-.09.18-.135.3-.27.456-.136.156-.285.35-.407.47-.136.133-.277.278-.12.548.156.268.692 1.13 1.486 1.834.1.088.196.173.29.253.945.812 1.69 1.054 1.93.125.133.155-.022.355-.135.49-.112.134-.495.58-.63.782-.134.202-.27.402.002.553.27.153 1.714.846 2.115 1.05.4.202.668.298.766.14.098-.157.4-.403.548-.56.148-.158.29-.134.49-.06.202.072 1.28.605 1.503.71.224.11.373.16.428.25.056.1.056.578-.196 1.29z"/>
                </svg>
                Venta Mayoreo
              </a>
              <a href="https://wa.me/529971356556?text=Hola,%20me%20gustaría%20obtener%20información%20sobre%20sus%20guayaberas%20y%20vestidos" target="_blank" class="bg-[#25D366] text-white px-6 py-3.5 rounded-full font-medium hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 shadow-md">
                <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.335 4.975L2 22l5.13-1.347a9.957 9.957 0 0 0 4.88 1.285h.005c5.507 0 9.99-4.474 9.992-9.986a9.94 9.94 0 0 0-2.927-7.064A9.925 9.925 0 0 0 12.012 2zm5.72 14.102c-.252.712-1.461 1.305-2.012 1.392-.5.08-1.15.117-1.826-.1-.415-.133-.925-.327-1.575-.61-2.766-1.202-4.546-4.005-4.683-4.192-.136-.188-1.114-1.485-1.114-2.833 0-1.348.705-2.012.956-2.28.252-.268.553-.335.737-.335.184 0 .368.002.528.01.163.007.385-.062.602.46.225.54.77 1.88.836 2.016.066.134.11.29.02.47-.09.18-.135.3-.27.456-.136.156-.285.35-.407.47-.136.133-.277.278-.12.548.156.268.692 1.13 1.486 1.834.1.088.196.173.29.253.945.812 1.69 1.054 1.93.125.133.155-.022.355-.135.49-.112.134-.495.58-.63.782-.134.202-.27.402.002.553.27.153 1.714.846 2.115 1.05.4.202.668.298.766.14.098-.157.4-.403.548-.56.148-.158.29-.134.49-.06.202.072 1.28.605 1.503.71.224.11.373.16.428.25.056.1.056.578-.196 1.29z"/>
                </svg>
                Atención a Clientes
              </a>
            </div>
          </div>

          <!-- Embedded Google Map -->
          <div class="h-96 w-full rounded-2xl overflow-hidden shadow-md border border-brand-pink/10 relative">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!4v1785346217387!6m8!1m7!1sUI5Dx_7k4WzVLenMFXdwoA!2m2!1d20.5307409281935!2d-89.33033575633362!3f151.03976232141125!4f-2.0368633428088714!5f0.7820865974627469" 
              width="100%" 
              height="100%" 
              style="border:0;" 
              allowfullscreen="" 
              loading="lazy" 
              referrerpolicy="no-referrer-when-downgrade">
            </iframe>
          </div>
        </div>
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
export class Inicio implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly seo = inject(Seo);
  private readonly router = inject(Router);

  readonly activeSlide = signal<number>(0);
  private slideInterval: ReturnType<typeof setInterval> | undefined;

  readonly promoProduct = computed(() => {
    return this.store.products().find(p => p.isOffer) || this.store.products()[0];
  });

  readonly homeCategories = computed(() => {
    const departmentsById = new Map(
      this.store.masterDepartamentos().map((department) => [
        Number(department.id),
        String(department.name || department.nombre || '').trim(),
      ])
    );
    const categories = new Map<string, {
      key: string;
      name: string;
      image: string;
      alt: string;
      description: string;
    }>();

    for (const product of this.store.products()) {
      const departmentName = product.departmentName
        || (product.department_id ? departmentsById.get(Number(product.department_id)) : '')
        || product.category;
      const name = String(departmentName || '').trim();
      if (!name) continue;

      const key = this.normalizeCategory(name);
      if (categories.has(key)) continue;

      const presentation = this.getCategoryPresentation(name, product.image);
      categories.set(key, {key, name, ...presentation});
    }

    return Array.from(categories.values());
  });


  ngOnInit() {
    // Commercial navigation checkpoint: refresh the real catalog once when Home opens.
    // The protected endpoint also lets the global interceptor surface 403/503 status
    // changes without polling /ecommerce/status. Store deduplicates any in-flight request.
    void this.store.loadProducts(true, true);

    // SEO optimization for index page
    this.seo.setMetaTags(
      'Inicio',
      'Creaciones Golondrina es tu tienda de confianza de ropa típica yucateca, guayaberas de lino presidenciales, hermosos vestidos y blusas bordadas para damas, caballeros y niños. Ubicados en Tekit, Yucatán, la Capital de la Guayabera.',
      ['guayaberas de lino', 'ropa tipica yucateca', 'Tekit Yucatan', 'vestidos huipil', 'Creaciones Golondrina', 'maestra artesana']
    );

    // Auto rotate slides
    this.startCarousel();
  }

  ngOnDestroy() {
    this.stopCarousel();
  }

  startCarousel() {
    this.stopCarousel();
    if (typeof window === 'undefined') return;
    this.slideInterval = setInterval(() => {
      this.nextSlide();
    }, 6000);
  }

  stopCarousel() {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }

  setSlide(index: number) {
    this.activeSlide.set(index);
    this.startCarousel(); // reset timer
  }

  nextSlide() {
    this.activeSlide.update(curr => (curr + 1) % 3);
  }

  prevSlide() {
    this.activeSlide.update(curr => (curr - 1 + 3) % 3);
  }

  private normalizeCategory(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
  }

  private getCategoryPresentation(name: string, productImage: string) {
    const key = this.normalizeCategory(name);
    const presentations: Record<string, {image: string; alt: string; description: string}> = {
      caballeros: {
        image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80',
        alt: 'Guayaberas para Caballeros',
        description: 'Guayaberas presidenciales, manga corta, de lino premium e hilo fino.',
      },
      damas: {
        image: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&w=600&q=80',
        alt: 'Ropa típica para Damas',
        description: 'Vestidos tradicionales "Huipil", blusas bordadas campesinas y de lino.',
      },
      ninos: {
        image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80',
        alt: 'Guayaberas y ropa típica para niños',
        description: 'Guayaberas infantiles suaves de algodón.',
      },
      ninas: {
        image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80',
        alt: 'Vestidos y ropa típica para niñas',
        description: 'Hermosos vestidos bordados.',
      },
    };

    return presentations[key] ?? {
      image: productImage,
      alt: `Colección ${name} de Creaciones Golondrina`,
      description: `Explora nuestra colección de ${name}.`,
    };
  }

  buyPromo() {
    const prod = this.promoProduct();
    if (!prod) return;
    // Default size and color
    // const size = prod.sizes[1] || 'M';
    // const color = prod.colors[0] || 'Blanco';
    // this.store.addToCart(prod, 1, size, color);
    // Alert or redirect to cart
    // We navigate to cart
    void this.router.navigate(['/producto', prod.id]);
  }

  goToCategory(category: string) {
    this.store.setCategory(category);
    void this.router.navigate(['/catalogo']);
  }
}
