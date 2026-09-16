import {ChangeDetectionStrategy, Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Seo} from '../components/seo';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-nosotros',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="py-16 bg-brand-cream animate-fade-in">
      <div class="container mx-auto px-4">
        <!-- Story Hero Section -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto mb-20">
          <div class="relative rounded-2xl overflow-hidden shadow-md aspect-4/3 border border-brand-pink/10">
            <img 
              src="https://assets.sm-panel.site/gallery/creacionesgolondrina/marta_puc_fundadora.jpeg" 
              alt="Maestra Artesana Martha María Puc Loeza" 
              class="w-full h-auto object-cover"
              referrerpolicy="no-referrer"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
            <div class="absolute bottom-6 left-6 text-white z-10">
              <p class="text-xs uppercase tracking-widest text-brand-yellow font-semibold">Fundadora</p>
              <h3 class="font-serif-brand text-2xl font-bold">Martha María Puc Loeza</h3>
            </div>
          </div>

          <div>
            <span class="text-brand-pink font-semibold uppercase tracking-widest text-xs">Nuestra Historia</span>
            <h1 class="font-serif-brand text-4xl font-bold text-gray-900 mt-2 mb-6">Creaciones Golondrina</h1>
            <div class="w-16 h-1 bg-brand-yellow rounded-full mb-6"></div>
            
            <p class="text-gray-700 leading-relaxed mb-4 text-sm md:text-base">
              Nacida en el corazón artesanal de <strong>Tekit, Yucatán</strong> (mundialmente reconocido como la <em>Capital de la Guayabera</em>), <strong>Creaciones Golondrina</strong> es una empresa familiar fundada y dirigida por la maestra artesana <strong>Martha María Puc Loeza</strong>.
            </p>
            <p class="text-gray-700 leading-relaxed mb-4 text-sm md:text-base">
              Con más de dos décadas de experiencia transmitiendo el arte de la aguja y los telares, en nuestro taller familiar confeccionamos guayaberas, vestidos, y blusas típicas con un alto nivel de detalle, rescatando e integrando diseños autóctonos como las flores regionales y el vuelo libre de la golondrina, símbolo de constancia, gracia y retorno a casa.
            </p>
            <p class="text-gray-700 leading-relaxed text-sm md:text-base">
              Nuestra misión es llevar un pedazo de la riqueza cultural yucateca a tu vestimenta diaria o de gala, asegurando que cada cliente reciba una prenda cómoda, fresca, duradera y colmada de tradición.
            </p>
          </div>
        </div>

        <!-- Local Pride section (Tekit, Yucatán) -->
        <div class="bg-white rounded-3xl p-8 md:p-12 border border-gray-100 shadow-sm max-w-5xl mx-auto mb-20">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div class="md:col-span-2">
              <span class="text-brand-pink font-semibold uppercase tracking-widest text-xs">Orgullo Local</span>
              <h2 class="font-serif-brand text-3xl font-bold text-gray-900 mt-2 mb-4">Tekit: Capital de la Guayabera</h2>
              <p class="text-gray-600 leading-relaxed text-sm md:text-base">
                Tekit es un pintoresco pueblo yucateco donde la confección textil es el alma y sustento de la comunidad. Aquí, la guayabera no es solo ropa; es identidad, arte y herencia maya-mestiza. En Creaciones Golondrina honramos este legado elaborando cada prenda directamente en nuestro taller familiar en la Col. San Rafael de Tekit.
              </p>
            </div>
            <div class="flex items-center justify-center">
              <div class="p-6 rounded-2xl bg-brand-light-pink border border-brand-pink/10 text-center">
                <mat-icon class="text-brand-pink text-5xl h-12 w-12 mx-auto">home_repair_service</mat-icon>
                <h4 class="font-serif-brand text-xl font-bold mt-3 text-gray-900">Taller 100% familiar</h4>
                <p class="text-xs text-gray-500 mt-1">Confección directa, sin intermediarios.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Business Details / Ficha Técnica -->
        <div class="max-w-4xl mx-auto">
          <div class="text-center mb-10">
            <h2 class="font-serif-brand text-2xl md:text-3xl font-bold text-gray-900">Detalles de Identidad y Contacto</h2>
            <div class="w-16 h-1 bg-brand-pink mx-auto mt-2 rounded-full"></div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white border border-gray-100 p-8 rounded-2xl shadow-sm text-sm md:text-base">
            <div class="space-y-4">
              <div class="border-b border-gray-50 pb-2">
                <span class="text-xs text-gray-400 block uppercase tracking-wider">Nombre Comercial</span>
                <span class="font-semibold text-gray-800 font-serif-brand text-lg">Creaciones Golondrina</span>
              </div>
              <div class="border-b border-gray-50 pb-2">
                <span class="text-xs text-gray-400 block uppercase tracking-wider">Directora y Propietaria</span>
                <span class="font-semibold text-gray-800">Martha María Puc Loeza</span>
              </div>
              <div class="border-b border-gray-50 pb-2">
                <span class="text-xs text-gray-400 block uppercase tracking-wider">Dirección Física</span>
                <span class="text-gray-600">C 31 x 18 y 20 col San Rafael, Tekit, Yucatán. CP 97680</span>
              </div>
            </div>

            <div class="space-y-4">
              <div class="border-b border-gray-50 pb-2">
                <span class="text-xs text-gray-400 block uppercase tracking-wider">Teléfonos Oficiales</span>
                <span class="font-semibold text-gray-800">997 114 1825 | 997 135 6556</span>
              </div>
              <div class="border-b border-gray-50 pb-2">
                <span class="text-xs text-gray-400 block uppercase tracking-wider">Correo Electrónico</span>
                <span class="text-gray-600">creacionesgolondrina54&#64;gmail.com</span>
              </div>
              <div class="border-b border-gray-50 pb-2">
                <span class="text-xs text-gray-400 block uppercase tracking-wider">Origen de Confección</span>
                <span class="font-semibold text-brand-pink">Tekit, Yucatán, México 🇲🇽</span>
              </div>
            </div>
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
    .aspect-4\\/3 {
      aspect-ratio: 4 / 3;
    }
  `
})
export class Nosotros implements OnInit {
  private readonly seo = inject(Seo);

  ngOnInit() {
    this.seo.setMetaTags(
      'Nosotros',
      'Conoce a Martha María Puc Loeza, fundadora de Creaciones Golondrina en Tekit, Yucatán. Confeccionamos ropa típica yucateca, guayaberas y vestidos con pasión, lino premium y un legado familiar de costura.',
      ['Martha Maria Puc Loeza', 'Tekit Yucatan guayaberas', 'historia de la guayabera', 'taller familiar yucateco']
    );
  }
}
