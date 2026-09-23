import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {Store} from '../components/store';
import {Logo} from '../components/logo';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, Logo, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-100 z-40 transition-all">
      <div class="container mx-auto px-4 h-20 flex items-center justify-between">
        <!-- Brand Logo & Name -->
        <a routerLink="/" class="flex items-center gap-3 group focus:outline-none">
          <app-logo height="44" width="44" classes="transition-transform group-hover:scale-102"></app-logo>
          <div class="flex flex-col text-left">
            <span class="font-serif-brand text-xs tracking-widest text-brand-pink font-semibold leading-none">CREACIONES</span>
            <span class="font-serif-brand text-xl md:text-2xl font-bold text-gray-900 tracking-tight leading-none mt-1">Golondrina</span>
          </div>
        </a>

        <!-- Desktop Navigation links -->
        <nav class="hidden lg:flex items-center gap-8 text-sm font-semibold text-gray-600">
          <a routerLink="/" routerLinkActive="text-brand-pink" [routerLinkActiveOptions]="{exact: true}" class="hover:text-brand-pink transition-colors">Inicio</a>
          <a routerLink="/catalogo" routerLinkActive="text-brand-pink" class="hover:text-brand-pink transition-colors">Catálogo</a>
          <a routerLink="/servicios" routerLinkActive="text-brand-pink" class="hover:text-brand-pink transition-colors">Servicios</a>
          <a routerLink="/nosotros" routerLinkActive="text-brand-pink" class="hover:text-brand-pink transition-colors">Nosotros</a>
        </nav>

        <!-- Right Action icons -->
        <div class="flex items-center gap-3">
          <!-- Wishlist Badge -->
          <a 
            routerLink="/wishlist" 
            routerLinkActive="text-brand-pink"
            class="p-2 text-gray-500 hover:text-brand-pink transition-colors relative"
            title="Mi Lista de Deseos"
          >
            <mat-icon>favorite_border</mat-icon>
            @if (store.wishlist().length > 0) {
              <span class="absolute top-1.5 right-1.5 bg-brand-pink text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-white">
                {{ store.wishlist().length }}
              </span>
            }
          </a>

          <!-- Cart Badge -->
          <a 
            routerLink="/carrito" 
            routerLinkActive="text-brand-pink"
            class="p-2 text-gray-500 hover:text-brand-pink transition-colors relative"
            title="Mi Carrito"
          >
            <mat-icon>shopping_cart</mat-icon>
            @if (store.cartTotalItems() > 0) {
              <span class="absolute top-1.5 right-1.5 bg-brand-pink text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-white animate-bounce-short">
                {{ store.cartTotalItems() }}
              </span>
            }
          </a>

          <!-- User Panel -->
          <!-- <a 
            routerLink="/usuario" 
            routerLinkActive="text-brand-pink"
            class="p-2 text-gray-500 hover:text-brand-pink transition-colors"
            title="Mi Cuenta"
          >
            <mat-icon>account_circle</mat-icon>
          </a> -->

          <!-- Responsive Menu Toggle Button -->
          <button 
            (click)="toggleMenu()" 
            class="p-2 text-gray-600 hover:text-brand-pink transition-colors lg:hidden focus:outline-none"
            aria-label="Abrir Menú"
          >
            <mat-icon>{{ isMenuOpen() ? 'close' : 'menu' }}</mat-icon>
          </button>
        </div>
      </div>

      <!-- Responsive Mobile Dropdown Navigation Menu -->
      @if (isMenuOpen()) {
        <div class="lg:hidden bg-white border-t border-gray-50 py-4 px-6 space-y-3 shadow-inner text-sm font-semibold text-gray-600 flex flex-col animate-slide-down">
          <a routerLink="/" (click)="closeMenu()" routerLinkActive="text-brand-pink" [routerLinkActiveOptions]="{exact: true}" class="py-2 hover:text-brand-pink border-b border-gray-50 transition-colors">Inicio</a>
          <a routerLink="/servicios" (click)="closeMenu()" routerLinkActive="text-brand-pink" class="py-2 hover:text-brand-pink border-b border-gray-50 transition-colors">Servicios</a>
          <a routerLink="/nosotros" (click)="closeMenu()" routerLinkActive="text-brand-pink" class="py-2 hover:text-brand-pink border-b border-gray-50 transition-colors">Nosotros</a>
          <a routerLink="/catalogo" (click)="closeMenu()" routerLinkActive="text-brand-pink" class="py-2 hover:text-brand-pink border-b border-gray-50 transition-colors">Catálogo</a>
          <a routerLink="/wishlist" (click)="closeMenu()" routerLinkActive="text-brand-pink" class="py-2 hover:text-brand-pink border-b border-gray-50 transition-colors flex items-center justify-between">
            <span>Lista de Deseos</span>
            <span class="bg-brand-light-pink text-brand-pink px-2.5 py-0.5 rounded-full text-xs font-bold">{{ store.wishlist().length }}</span>
          </a>
          <a routerLink="/carrito" (click)="closeMenu()" routerLinkActive="text-brand-pink" class="py-2 hover:text-brand-pink transition-colors flex items-center justify-between">
            <span>Carrito</span>
            <span class="bg-brand-light-pink text-brand-pink px-2.5 py-0.5 rounded-full text-xs font-bold">{{ store.cartTotalItems() }}</span>
          </a>
        </div>
      }
    </header>
  `,
  styles: `
    .animate-slide-down {
      animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-bounce-short {
      animation: bounceShort 0.5s ease-out 1;
    }
    @keyframes bounceShort {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }
  `
})
export class Header {
  readonly store = inject(Store);
  readonly isMenuOpen = signal<boolean>(false);

  toggleMenu() {
    this.isMenuOpen.update(v => !v);
  }

  closeMenu() {
    this.isMenuOpen.set(false);
  }
}
