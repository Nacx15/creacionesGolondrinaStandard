import {ChangeDetectionStrategy, Component, inject, signal, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Store, CartItem} from '../components/store';
import {Seo} from '../components/seo';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="py-12 bg-brand-cream animate-fade-in text-xs md:text-sm">
      <div class="container mx-auto px-4">
        <!-- Header -->
        <div class="text-center max-w-xl mx-auto mb-10">
          <h1 class="font-serif-brand text-4xl font-bold text-gray-900">Panel de Usuario</h1>
          <div class="w-12 h-1 bg-brand-pink mx-auto mt-2 rounded-full mb-4"></div>
          <p class="text-gray-500">
            Gestiona tus datos personales, direcciones de entrega y rastrea tus compras directas del taller de Tekit.
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <!-- Left Column: User Profile Form/Details (1 col) -->
          <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-auto self-start">
            <div class="text-center pb-6 border-b border-gray-100 mb-6">
              <!-- Avatar Circle representing the weaver/client -->
              <div class="w-20 h-20 bg-brand-light-pink rounded-full flex items-center justify-center text-brand-pink mx-auto mb-4 border border-brand-pink/15">
                <mat-icon class="text-4xl h-10 w-10">account_circle</mat-icon>
              </div>
              <h3 class="font-serif-brand text-xl font-bold text-gray-900 leading-snug">{{ store.userProfile().name }}</h3>
              <p class="text-xs text-brand-pink font-semibold uppercase tracking-wider mt-1">Miembro de Creaciones Golondrina</p>
            </div>

            <!-- Profile View & Edit Modes -->
            @if (!isEditing()) {
              <div class="space-y-4">
                <div>
                  <span class="text-[10px] text-gray-400 block uppercase tracking-wider">Correo Registrado</span>
                  <span class="font-semibold text-gray-800">{{ store.userProfile().email }}</span>
                </div>
                <div>
                  <span class="text-[10px] text-gray-400 block uppercase tracking-wider">Teléfono</span>
                  <span class="font-semibold text-gray-800">{{ store.userProfile().phone }}</span>
                </div>
                <div>
                  <span class="text-[10px] text-gray-400 block uppercase tracking-wider">Dirección Predeterminada</span>
                  <span class="font-medium text-gray-600 block">{{ store.userProfile().address }}</span>
                </div>
                <div>
                  <span class="text-[10px] text-gray-400 block uppercase tracking-wider">Sobre mí / Notas</span>
                  <span class="text-gray-500 italic block">{{ store.userProfile().bio }}</span>
                </div>

                <button 
                  (click)="startEdit()" 
                  class="w-full mt-4 bg-brand-cream hover:bg-gray-100 text-brand-pink border border-brand-pink/10 font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <mat-icon class="text-sm">edit</mat-icon> Editar Datos Personales
                </button>
              </div>
            } @else {
              <!-- Edit mode form -->
              <div class="space-y-4 text-xs md:text-sm">
                <div>
                  <label for="user-fullname" class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Nombre Completo</label>
                  <input id="user-fullname" type="text" [value]="editName()" (input)="editName.set($any($event.target).value)" class="w-full px-3 py-2 bg-brand-cream border border-transparent rounded-xl focus:border-brand-pink/30 focus:outline-none" />
                </div>
                <div>
                  <label for="user-email" class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Correo Electrónico</label>
                  <input id="user-email" type="email" [value]="editEmail()" (input)="editEmail.set($any($event.target).value)" class="w-full px-3 py-2 bg-brand-cream border border-transparent rounded-xl focus:border-brand-pink/30 focus:outline-none" />
                </div>
                <div>
                  <label for="user-phone" class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Teléfono</label>
                  <input id="user-phone" type="tel" [value]="editPhone()" (input)="editPhone.set($any($event.target).value)" class="w-full px-3 py-2 bg-brand-cream border border-transparent rounded-xl focus:border-brand-pink/30 focus:outline-none" />
                </div>
                <div>
                  <label for="user-addr" class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Dirección Completa de Envío</label>
                  <textarea id="user-addr" rows="3" [value]="editAddr()" (input)="editAddr.set($any($event.target).value)" class="w-full px-3 py-2 bg-brand-cream border border-transparent rounded-xl focus:border-brand-pink/30 focus:outline-none resize-none"></textarea>
                </div>
                <div>
                  <label for="user-bio" class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Bio / Notas de Cliente</label>
                  <textarea id="user-bio" rows="2" [value]="editBio()" (input)="editBio.set($any($event.target).value)" class="w-full px-3 py-2 bg-brand-cream border border-transparent rounded-xl focus:border-brand-pink/30 focus:outline-none resize-none"></textarea>
                </div>

                <div class="grid grid-cols-2 gap-3 pt-2">
                  <button (click)="cancelEdit()" class="bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold py-2 rounded-xl transition-all text-center">
                    Cancelar
                  </button>
                  <button (click)="saveEdit()" class="bg-brand-pink hover:bg-brand-dark text-white font-semibold py-2 rounded-xl transition-all text-center">
                    Guardar
                  </button>
                </div>
              </div>
            }
          </div>

          <!-- Right Column: Order History and Tracking (2 cols) -->
          <div class="lg:col-span-2 space-y-6">
            <div class="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm">
              <h3 class="font-serif-brand text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100 flex items-center gap-2">
                <mat-icon class="text-brand-pink">receipt_long</mat-icon> Historial y Seguimiento de Pedidos
              </h3>

              @if (store.orders().length === 0) {
                <div class="text-center py-12">
                  <mat-icon class="text-gray-300 text-5xl h-12 w-12 mx-auto mb-3">production_quantity_limits</mat-icon>
                  <p class="text-gray-500 text-sm">Aún no has registrado ninguna compra con nosotros.</p>
                </div>
              } @else {
                <div class="space-y-6">
                  @for (order of store.orders(); track order.id) {
                    <div class="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                      <!-- Ticket Header banner -->
                      <div class="bg-brand-cream px-5 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 gap-2">
                        <div>
                          <span class="text-[10px] text-gray-400 block uppercase">Código de Pedido</span>
                          <span class="font-mono font-bold text-gray-900">{{ order.id }}</span>
                        </div>
                        <div class="flex items-center gap-4">
                          <div>
                            <span class="text-[10px] text-gray-400 block uppercase text-right sm:text-left">Fecha</span>
                            <span class="font-semibold text-gray-700">{{ order.date }}</span>
                          </div>
                          <!-- Status badge -->
                          <div class="flex items-center">
                            @if (order.status === 'Entregado') {
                              <span class="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                <span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Entregado
                              </span>
                            } @else if (order.status === 'Enviado') {
                              <span class="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                <span class="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span> Enviado
                              </span>
                            } @else {
                              <span class="bg-brand-light-pink text-brand-pink px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                <span class="w-1.5 h-1.5 rounded-full bg-brand-pink animate-ping"></span> Procesando
                              </span>
                            }
                          </div>
                        </div>
                      </div>

                      <!-- Ticket Items -->
                      <div class="p-5 space-y-4">
                        <div class="divide-y divide-gray-50">
                          @for (item of order.items; track item.product.id) {
                            <div class="py-2.5 flex justify-between items-center text-xs md:text-sm first:pt-0 last:pb-0">
                              <div>
                                <span class="font-bold text-gray-800">{{ item.product.name }}</span>
                                <p class="text-gray-400 text-[10px]">Talla: {{ item.selectedSize }} | Color: {{ item.selectedColor }} | Qty: {{ item.quantity }}</p>
                              </div>
                              <span class="font-semibold text-gray-900">{{ '$' + (getItemPrice(item) * item.quantity) }} MXN</span>
                            </div>
                          }
                        </div>

                        <!-- Total cost summary and metadata -->
                        <div class="pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div>
                            <span class="text-[10px] text-gray-400 block uppercase">Dirección de Entrega</span>
                            <span class="text-gray-600 text-[11px] leading-tight block">{{ order.shippingAddress }}</span>
                          </div>
                          <div class="text-right self-end sm:self-center">
                            <span class="text-[10px] text-gray-400 block">Pago vía {{ order.paymentMethod }}</span>
                            <span class="font-bold text-brand-pink text-base">Total: {{ '$' + order.total }} MXN</span>
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
export class Usuario implements OnInit {
  readonly store = inject(Store);
  private readonly seo = inject(Seo);

  readonly isEditing = signal<boolean>(false);

  // Editing form variables
  readonly editName = signal<string>('');
  readonly editEmail = signal<string>('');
  readonly editPhone = signal<string>('');
  readonly editAddr = signal<string>('');
  readonly editBio = signal<string>('');

  ngOnInit() {
    this.seo.setMetaTags(
      'Panel de Gestión de Usuario',
      'Administra tu información de contacto de Creaciones Golondrina y rastrea tus pedidos de guayaberas y huipiles directamente desde nuestro taller de Tekit, Yucatán.',
      ['mi cuenta', 'seguimiento de guayaberas', 'Martha Maria Puc Loeza', 'Tekit Yucatan']
    );
  }

  getItemPrice(item: CartItem): number {
    return Number(item.unitPrice ?? this.store.getVariant(item.product, item.selectedSize, item.selectedColor)?.precio_ecommerce ?? item.product.precio_ecommerce ?? 0);
  }

  startEdit() {
    const prof = this.store.userProfile();
    this.editName.set(prof.name);
    this.editEmail.set(prof.email);
    this.editPhone.set(prof.phone);
    this.editAddr.set(prof.address);
    this.editBio.set(prof.bio);
    this.isEditing.set(true);
  }

  cancelEdit() {
    this.isEditing.set(false);
  }

  saveEdit() {
    this.store.updateUserProfile({
      name: this.editName(),
      email: this.editEmail(),
      phone: this.editPhone(),
      address: this.editAddr(),
      bio: this.editBio()
    });
    this.isEditing.set(false);
  }
}
