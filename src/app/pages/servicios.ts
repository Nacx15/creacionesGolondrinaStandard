import {ChangeDetectionStrategy, Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Seo} from '../components/seo';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-servicios',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="py-16 bg-brand-cream animate-fade-in">
      <div class="container mx-auto px-4">
        <!-- Section Header -->
        <div class="text-center max-w-2xl mx-auto mb-16">
          <span class="text-brand-pink font-semibold uppercase tracking-widest text-xs">Artesanía Especializada</span>
          <h1 class="font-serif-brand text-4xl font-bold text-gray-900 mt-2 mb-4">Nuestros Servicios</h1>
          <div class="w-16 h-1 bg-brand-pink mx-auto rounded-full mb-6"></div>
          <p class="text-gray-600 leading-relaxed">
            En Creaciones Golondrina, combinamos la confección artesanal clásica con servicios adaptados a tus necesidades especiales, bodas, uniformes y envíos.
          </p>
        </div>

        <!-- Services Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
          <!-- Servicio 1 -->
          <div class="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div class="w-12 h-12 bg-brand-light-pink rounded-xl flex items-center justify-center text-brand-pink mb-6">
              <mat-icon class="text-2xl">style</mat-icon>
            </div>
            <h3 class="font-serif-brand text-2xl font-bold text-gray-900 mb-3">Sastrería y Confección a la Medida</h3>
            <p class="text-gray-600 leading-relaxed mb-4 text-sm md:text-base">
              ¿Tienes un evento especial o necesitas un ajuste exacto? Realizamos confecciones a la medida en guayaberas de lino y vestidos de gala. Elige tu tela favorita (lino premium, hilo de algodón) y la diseñamos especialmente para ti.
            </p>
            <ul class="space-y-2 text-sm text-gray-700 font-medium">
              <li class="flex items-start gap-2"><mat-icon class="text-brand-pink text-sm shrink-0 mt-0.5">check_circle</mat-icon> Toma de medidas personalizada en nuestro taller.</li>
              <li class="flex items-start gap-2"><mat-icon class="text-brand-pink text-sm shrink-0 mt-0.5">check_circle</mat-icon> Elección de hilos, colores y patrones de alforzas.</li>
              <li class="flex items-start gap-2"><mat-icon class="text-brand-pink text-sm shrink-0 mt-0.5">check_circle</mat-icon> Ajustes sin costo adicional durante el proceso.</li>
            </ul>
          </div>

          <!-- Servicio 2 -->
          <div class="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div class="w-12 h-12 bg-brand-light-pink rounded-xl flex items-center justify-center text-brand-pink mb-6">
              <mat-icon class="text-2xl">groups</mat-icon>
            </div>
            <h3 class="font-serif-brand text-2xl font-bold text-gray-900 mb-3">Venta al Mayoreo para Bodas y Eventos</h3>
            <p class="text-gray-600 leading-relaxed mb-4 text-sm md:text-base">
              Hacemos que tu boda de playa, bautizo o convención luzca impecable. Ofrecemos atractivos descuentos para compras grupales o de mayoreo en guayaberas de caballeros, vestidos y uniformes de lino tradicionales.
            </p>
            <ul class="space-y-2 text-sm text-gray-700 font-medium">
              <li class="flex items-start gap-2"><mat-icon class="text-brand-pink text-sm shrink-0 mt-0.5">check_circle</mat-icon> Precios especiales a partir de 10 piezas.</li>
              <li class="flex items-start gap-2"><mat-icon class="text-brand-pink text-sm shrink-0 mt-0.5">check_circle</mat-icon> Personalización con iniciales bordadas o logotipos corporativos.</li>
              <li class="flex items-start gap-2"><mat-icon class="text-brand-pink text-sm shrink-0 mt-0.5">check_circle</mat-icon> Garantía de entrega puntual directamente en tu hotel o domicilio.</li>
            </ul>
          </div>

          <!-- Servicio 3 -->
          <div class="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div class="w-12 h-12 bg-brand-light-pink rounded-xl flex items-center justify-center text-brand-pink mb-6">
              <mat-icon class="text-2xl">auto_awesome</mat-icon>
            </div>
            <h3 class="font-serif-brand text-2xl font-bold text-gray-900 mb-3">Diseño de Bordado Tradicional</h3>
            <p class="text-gray-600 leading-relaxed mb-4 text-sm md:text-base">
              Personalizamos tus prendas con técnicas yucatecas de punto de cruz, punto de satín y calados rejillados finos. Nuestros artesanos dominan los patrones florales regionales y las representaciones icónicas de las golondrinas.
            </p>
            <ul class="space-y-2 text-sm text-gray-700 font-medium">
              <li class="flex items-start gap-2"><mat-icon class="text-brand-pink text-sm shrink-0 mt-0.5">check_circle</mat-icon> Elección de hilos de algodón mercerizado de alta solidez.</li>
              <li class="flex items-start gap-2"><mat-icon class="text-brand-pink text-sm shrink-0 mt-0.5">check_circle</mat-icon> Recreación de patrones históricos y familiares de huipiles.</li>
              <li class="flex items-start gap-2"><mat-icon class="text-brand-pink text-sm shrink-0 mt-0.5">check_circle</mat-icon> Opción de bordado 100% hecho a mano o en máquina artesanal.</li>
            </ul>
          </div>

          <!-- Servicio 4 -->
          <div class="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div class="w-12 h-12 bg-brand-light-pink rounded-xl flex items-center justify-center text-brand-pink mb-6">
              <mat-icon class="text-2xl">local_shipping</mat-icon>
            </div>
            <h3 class="font-serif-brand text-2xl font-bold text-gray-900 mb-3">Envíos Nacionales e Internacionales</h3>
            <p class="text-gray-600 leading-relaxed mb-4 text-sm md:text-base">
              Llevamos la elegancia yucateca hasta tu puerta. Contamos con alianzas logísticas seguras para enviar nuestras guayaberas y vestidos a todo México, Estados Unidos, Canadá y países europeos de forma rápida y rastreable.
            </p>
            <ul class="space-y-2 text-sm text-gray-700 font-medium">
              <li class="flex items-start gap-2"><mat-icon class="text-brand-pink text-sm shrink-0 mt-0.5">check_circle</mat-icon> Empaque protector especial para linos finos.</li>
              <li class="flex items-start gap-2"><mat-icon class="text-brand-pink text-sm shrink-0 mt-0.5">check_circle</mat-icon> Provisión de código de rastreo en tiempo real.</li>
              <li class="flex items-start gap-2"><mat-icon class="text-brand-pink text-sm shrink-0 mt-0.5">check_circle</mat-icon> Seguro de envío incluido para total tranquilidad de compra.</li>
            </ul>
          </div>
        </div>

        <!-- Contact CTA -->
        <div class="mt-16 bg-brand-pink text-white text-center p-8 md:p-12 rounded-3xl max-w-4xl mx-auto shadow-lg relative overflow-hidden">
          <div class="absolute -right-16 -bottom-16 w-64 h-64 bg-white/5 rounded-full"></div>
          <h3 class="font-serif-brand text-3xl font-bold mb-4">¿Deseas una prenda personalizada o cotización de mayoreo?</h3>
          <p class="text-gray-100 max-w-xl mx-auto mb-8 text-sm md:text-base">
            Escríbenos directamente por WhatsApp. Te daremos una asesoría sin compromiso sobre telas, bordados, tiempos de confección y precios especiales de taller.
          </p>
          <a href="https://wa.me/529971141825?text=Hola,%20me%20gustaría%20cotizar%20unas%20guayaberas/vestidos%20a%20la%20medida/mayoreo" target="_blank" class="inline-flex bg-brand-dark hover:bg-opacity-90 text-white font-semibold px-8 py-3.5 rounded-full transition-all gap-2 items-center shadow-md justify-center">
            <mat-icon>chat</mat-icon> Chatear con Creaciones Golondrina
          </a>
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
export class Servicios implements OnInit {
  private readonly seo = inject(Seo);

  ngOnInit() {
    this.seo.setMetaTags(
      'Servicios de Confección',
      'Descubre nuestros servicios de sastrería a la medida de guayaberas presidenciales de lino, venta al mayoreo para bodas o eventos, bordado artesanal de punto de cruz y envíos nacionales e internacionales seguros.',
      ['guayaberas a la medida', 'sastreria Tekit', 'bodas de lino', 'mayoreo ropa yucateca', 'bordado artesanal']
    );
  }
}
