import {ChangeDetectionStrategy, Component} from '@angular/core';
import {RouterLink} from '@angular/router';
import {Logo} from '../components/logo';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, Logo, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="bg-brand-dark text-gray-300 pt-16 pb-8 border-t border-white/5 relative overflow-hidden">
      <!-- Background subtle graphics -->
      <div class="absolute -right-24 -bottom-24 w-80 h-80 bg-brand-pink/5 rounded-full blur-2xl"></div>
      
      <div class="container mx-auto px-4 relative z-10">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/10 text-xs md:text-sm">
          <!-- Column 1: Brand & Logo representation -->
          <div class="md:col-span-1.5 flex flex-col items-center md:items-start text-center md:text-left">
            <a routerLink="/" class="flex flex-col items-center md:items-start group mb-4">
              <app-logo height="100" width="100" classes="bg-white/5 p-2 rounded-2xl"></app-logo>
              <h4 class="font-serif-brand text-2xl font-bold text-white tracking-tight mt-3">Creaciones Golondrina</h4>
              <p class="text-[10px] tracking-widest text-brand-pink font-semibold uppercase mt-0.5">Tekit, Yucatán, México</p>
            </a>
            <p class="text-gray-400 text-xs leading-relaxed max-w-sm mt-2">
              Maestría en costura y bordado típico yucateco. Confección artesanal de guayaberas, vestidos de gala y blusas finas directamente de nuestro taller familiar.
            </p>
          </div>

          <!-- Column 2: Navigation Links -->
          <div class="text-center md:text-left">
            <h5 class="text-white font-serif-brand text-lg font-bold mb-4 uppercase tracking-wider">Enlaces</h5>
            <ul class="space-y-3 font-semibold">
              <li><a routerLink="/" class="hover:text-brand-pink transition-colors">Inicio</a></li>
              <li><a routerLink="/servicios" class="hover:text-brand-pink transition-colors">Servicios</a></li>
              <li><a routerLink="/nosotros" class="hover:text-brand-pink transition-colors">Nosotros</a></li>
              <li><a routerLink="/catalogo" class="hover:text-brand-pink transition-colors">Nuestro Catálogo</a></li>
              <!-- <li><a routerLink="/usuario" class="hover:text-brand-pink transition-colors">Mi Cuenta</a></li> -->
            </ul>
          </div>

          <!-- Column 3: Contact details -->
          <div class="text-center md:text-left">
            <h5 class="text-white font-serif-brand text-lg font-bold mb-4 uppercase tracking-wider">Contacto Directo</h5>
            <ul class="space-y-3.5 text-gray-400">
              <li class="flex items-start justify-center md:justify-start gap-2.5">
                <mat-icon class="text-brand-pink text-base shrink-0 mt-0.5">place</mat-icon>
                <span>C 31 x 18 y 20 col San Rafael, Tekit, Yucatán, CP 97680</span>
              </li>
              <li class="flex items-center justify-center md:justify-start gap-2.5">
                <mat-icon class="text-brand-pink text-base shrink-0">phone</mat-icon>
                <span>997 114 1825 | 997 135 6556</span>
              </li>
              <li class="flex items-center justify-center md:justify-start gap-2.5">
                <mat-icon class="text-brand-pink text-base shrink-0">email</mat-icon>
                <span class="break-all">creacionesgolondrina54&#64;gmail.com</span>
              </li>
              <li class="flex items-center justify-center md:justify-start gap-2.5">
                <mat-icon class="text-brand-pink text-base shrink-0">person</mat-icon>
                <span>Prop. Martha María Puc Loeza</span>
              </li>
            </ul>
          </div>

          <!-- Column 4: Guayabera Pride -->
          <div class="text-center md:text-left">
            <h5 class="text-white font-serif-brand text-lg font-bold mb-4 uppercase tracking-wider">Artesanía de Tekit</h5>
            <p class="text-gray-400 text-xs leading-relaxed mb-4">
              Cada prenda que compras ayuda a conservar las técnicas ancestrales de bordado maya-mestizo en Yucatán y apoya directamente a artesanos locales de Tekit.
            </p>
            <div class="flex justify-center md:justify-start gap-3">
              <!-- Certified logo shield simulation -->
              <div class="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-[10px] text-brand-yellow font-bold uppercase tracking-wider">
                <mat-icon class="text-[14px] h-3.5 w-3.5 shrink-0">verified</mat-icon>
                <span class="leading-tight text-left">Confección Yucateca Orgullosa</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Copyrights and final metadata -->
        <div class="pt-8 flex flex-col md:flex-row justify-between items-center text-center gap-4 text-xs text-gray-500">
          <p>&copy; 2026 Creaciones Golondrina. Todos los derechos reservados.</p>
          <p>
            Hecho a mano en <strong class="text-gray-400">Tekit, Yucatán, México</strong> &bull; Confección familiar premium de lino.
          </p>
        </div>

        <div class="flex justify-center items-center">
          <a href="https://smnsolutions.sm-panel.site/" target="_blank" 
                rel="noopener noreferrer"  style="font-size: smaller;">Desarrollado por SMN SOLUTIONS</a><mat-icon class="ml-2">language</mat-icon>
        </div>
      </div>
    </footer>
  `
})
export class Footer {}
