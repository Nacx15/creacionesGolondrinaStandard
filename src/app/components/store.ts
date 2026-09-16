import {DestroyRef, Injectable, PLATFORM_ID, computed, effect, inject, isDevMode, signal} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';
import {environment} from '../../environments/environment';
import {EcommerceStatusService} from '../services/ecommerce-status.service';
import {ToastService} from '../services/toast.service';
import {getApiErrorMessage} from '../shared/http/api-error.util';

export const GUAYAFLOW_ECOMMERCE_STANDARD_VERSION = '1.0.0';
const CART_STORAGE_KEY = 'creaciones_golondrina_cart';
const WISHLIST_STORAGE_KEY = 'creaciones_golondrina_wishlist';
const FALLBACK_IMAGE = '/assets/images/creaciones_golondrina_hero_1783140251646.jpg';

function loadFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof localStorage === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : defaultValue;
  } catch { return defaultValue; }
}
function saveToStorage<T>(key: string, value: T) {
  if (typeof localStorage === 'undefined') return;
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage is best effort */ }
}
export function mapSizeToNumber(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const clean = String(value).trim().toUpperCase();
  return /^\d+$/.test(clean) ? clean : clean;
}
const asNumber = (value: unknown) => Number.isFinite(Number(value)) ? Number(value) : 0;

export interface ApiVariante {
  id: number;
  sku?: string;
  descripcion?: string;
  precio_publico?: number;
  precio_ecommerce?: number;
  ecommerce_price?: number;
  hex?: string;
  color?: string;
  color_id?: number;
  talla?: string;
  talla_id?: number;
  qtyBodega?: number;
  qty_bodega?: number;
  qtyApartado?: number;
  qty_apartado?: number;
  availableBodega?: number;
  available_bodega?: number;
  qtyProduccion?: number;
  qtyPreventa?: number;
  images_url?: string[];
}
export interface ApiColorImage { color_id: string; images_url: string[]; }
export interface ApiTalla { id: number; department_id: number; name: string; code: string; }
export interface ApiColor { id: number; name: string; hex_code: string; }
export interface ApiDepartamento { id: number; name?: string; nombre?: string; descripcion?: string; }
export interface ApiManga { id: number; name?: string; nombre?: string; }
export interface ApiProducto {
  id: number;
  nombre: string;
  ref_code?: string;
  precio_publico?: number;
  precio_ecommerce?: number;
  ecommerce_price?: number;
  precio_mayoreo?: number;
  department_id?: number;
  departamento?: string;
  images_url?: string[];
  color_images?: ApiColorImage[];
  variantes?: ApiVariante[];
  manga?: string;
  tipo_manga?: string;
}
export interface ApiEcommerceResponse {
  departamentos?: ApiDepartamento[];
  tallas?: ApiTalla[];
  colores?: ApiColor[];
  mangas?: ApiManga[];
  productos?: ApiProducto[];
  data?: {productos?: ApiProducto[]};
}

export interface ProductVariant {
  id: number;
  sku: string;
  descripcion: string;
  precio_ecommerce: number;
  precio_publico: number;
  hex: string;
  color: string;
  color_id: number;
  talla: string;
  talla_id: number;
  qtyBodega: number;
  qtyApartado: number;
  qty_apartado: number;
  availableBodega: number;
  qtyProduccion: number;
  qtyPreventa: number;
  images_url: string[];
}
export interface Product {
  id: string;
  name: string;
  description: string;
  detailed_desc: string;
  price: number;
  precio_ecommerce: number;
  precio_publico?: number;
  precio_mayoreo?: number;
  ref_code?: string;
  image: string;
  category: 'Damas' | 'Caballeros' | 'Niños';
  type: 'Guayabera' | 'Vestido' | 'Blusa';
  sizes: string[];
  colors: string[];
  rating: number;
  reviewsCount: number;
  isOffer: boolean;
  offerPrice?: number;
  stock: number;
  fabric: string;
  embroidery: string;
  reviews: {author: string; rating: number; date: string; comment: string;}[];
  variantes: ProductVariant[];
  color_images: ApiColorImage[];
  department_id?: number;
  manga?: string;
  colorList?: {name: string; hex: string}[];
}
export interface CartItem {
  product: Product;
  variantId: number;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
  unitPrice: number;
}
export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  status: 'Procesando' | 'Enviado' | 'Entregado';
  shippingAddress: string;
  shippingName: string;
  phone: string;
  email: string;
  paymentMethod: 'MercadoPago' | 'WhatsApp' | 'Stripe' | 'PayPal';
}

@Injectable({providedIn: 'root'})
export class Store {
  private readonly http = inject(HttpClient);
  private readonly statusService = inject(EcommerceStatusService);
  private readonly toast = inject(ToastService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly browser = isPlatformBrowser(this.platformId);

  readonly products = signal<Product[]>([]);
  readonly catalogLoading = signal(false);
  readonly catalogError = signal<string | null>(null);
  readonly masterDepartamentos = signal<ApiDepartamento[]>([]);
  readonly masterTallas = signal<ApiTalla[]>([]);
  readonly masterColores = signal<ApiColor[]>([]);
  readonly masterMangas = signal<ApiManga[]>([]);
  readonly cart = signal<CartItem[]>(loadFromStorage<CartItem[]>(CART_STORAGE_KEY, []));
  readonly wishlist = signal<string[]>(loadFromStorage<string[]>(WISHLIST_STORAGE_KEY, []));
  readonly orders = signal<Order[]>([]);
  readonly userProfile = signal({name: '', email: '', phone: '', address: '', bio: ''});

  readonly searchQuery = signal('');
  readonly selectedCategory = signal('Todos');
  readonly selectedType = signal('Todos');
  readonly selectedSize = signal('Todos');
  readonly selectedColor = signal('Todos');
  readonly selectedManga = signal('Todos');
  readonly priceRange = signal(2000);

  private catalogPromise?: Promise<boolean>;
  private catalogMonitorId?: number;
  private catalogMonitoringStarted = false;

  constructor() {
    effect(() => saveToStorage(CART_STORAGE_KEY, this.cart()));
    effect(() => saveToStorage(WISHLIST_STORAGE_KEY, this.wishlist()));
    this.startCatalogMonitoring();
    void this.bootstrapCatalog();
  }

  private async bootstrapCatalog() {
    const status = await this.statusService.ensureStatus();
    if (status === 'active') {
      const loaded = await this.loadProducts();
      if (loaded && this.cart().length) await this.revalidateCart(false, false);
    }
  }

  async loadProducts(force = false, background = false): Promise<boolean> {
    // A forced checkout revalidation, a polling tick and a focus event can happen at
    // almost the same time. Always reuse the in-flight catalog request so all callers
    // reconcile against the same authoritative snapshot.
    if (this.catalogPromise) return this.catalogPromise;
    if (!force && this.products().length > 0) return true;
    this.catalogPromise = this.fetchProducts(background).finally(() => { this.catalogPromise = undefined; });
    return this.catalogPromise;
  }

  /**
   * Keeps product/variant inventory synchronized with GuayaFlow while the storefront
   * remains open. It refreshes periodically and immediately when the shopper returns
   * to the tab, then reconciles the cart against the fresh availableBodega values.
   */
  startCatalogMonitoring(): void {
    if (!this.browser || this.catalogMonitoringStarted) return;
    this.catalogMonitoringStarted = true;

    const intervalMs = Math.max(5000, Number(environment.catalogPollMs ?? 10000));
    const refresh = () => {
      if (document.visibilityState === 'hidden' || this.statusService.status() !== 'active') return;
      void this.refreshCatalogAndCart();
    };
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };

    this.catalogMonitorId = window.setInterval(refresh, intervalMs);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refreshWhenVisible);

    this.destroyRef.onDestroy(() => {
      if (this.catalogMonitorId !== undefined) window.clearInterval(this.catalogMonitorId);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
      this.catalogMonitorId = undefined;
      this.catalogMonitoringStarted = false;
    });

    if (isDevMode()) console.debug(`[GuayaFlow] catalog/stock monitor: ${intervalMs}ms`);
  }

  async refreshCatalogAndCart(showToast = true): Promise<boolean> {
    if (this.statusService.status() !== 'active') return false;
    const loaded = await this.loadProducts(true, true);
    if (!loaded) return false;
    if (this.cart().length) await this.revalidateCart(showToast, false);
    return true;
  }

  private async fetchProducts(background = false): Promise<boolean> {
    if (!background) this.catalogLoading.set(true);
    this.catalogError.set(null);
    try {
      // The changing query value prevents browser/intermediary caches from serving a
      // previous inventory snapshot after stock changes in the ERP.
      const refreshToken = Date.now();
      const data = await firstValueFrom(this.http.get<ApiEcommerceResponse>(`${environment.apiUrl}/productos/ecommerce`, {params: {_gf_refresh: refreshToken}}));
      this.masterDepartamentos.set(Array.isArray(data?.departamentos) ? data.departamentos : []);
      this.masterTallas.set(Array.isArray(data?.tallas) ? data.tallas : []);
      this.masterColores.set(Array.isArray(data?.colores) ? data.colores : []);
      this.masterMangas.set(Array.isArray(data?.mangas) ? data.mangas : []);
      const source = Array.isArray(data?.productos) ? data.productos : Array.isArray(data?.data?.productos) ? data.data!.productos! : [];
      this.products.set(source.map((product) => this.mapProduct(product)));
      return true;
    } catch (error) {
      this.products.set([]);
      const message = getApiErrorMessage(error, 'No fue posible cargar el catálogo real.');
      this.catalogError.set(message);
      return false;
    } finally {
      if (!background) this.catalogLoading.set(false);
    }
  }

  private mapProduct(api: ApiProducto): Product {
    const variants = (api.variantes ?? []).map((raw) => this.mapVariant(raw, api));
    const ecommercePrices = variants.map((v) => v.precio_ecommerce).filter((p) => p > 0);
    const productPrice = asNumber(api.precio_ecommerce ?? api.ecommerce_price);
    const price = ecommercePrices.length ? Math.min(...ecommercePrices) : productPrice;
    const colors = [...new Set(variants.map((v) => v.color).filter(Boolean))];
    const sizes = [...new Set(variants.map((v) => v.talla).filter(Boolean))];
    const colorList = colors.map((name) => ({name, hex: variants.find((v) => v.color === name)?.hex || '#CCCCCC'}));
    const dept = String(api.departamento ?? '').toLowerCase();
    const category: Product['category'] = dept.includes('dam') || dept.includes('muj') ? 'Damas' : dept.includes('niñ') || dept.includes('inf') ? 'Niños' : 'Caballeros';
    const lower = String(api.nombre ?? '').toLowerCase();
    const type: Product['type'] = lower.includes('blusa') ? 'Blusa' : lower.includes('vestido') || lower.includes('huipil') ? 'Vestido' : 'Guayabera';
    const image = api.images_url?.find(Boolean) || api.color_images?.flatMap((entry) => entry.images_url ?? []).find(Boolean) || FALLBACK_IMAGE;
    return {
      id: String(api.id),
      name: api.nombre,
      ref_code: api.ref_code,
      description: `Prenda de confección artesanal modelo ${api.nombre}${api.ref_code ? ` (Ref: ${api.ref_code})` : ''}.`,
      detailed_desc: `Modelo ${api.nombre} de Creaciones Golondrina, confeccionado en Tekit, Yucatán.`,
      price,
      precio_ecommerce: price,
      precio_publico: asNumber(api.precio_publico),
      precio_mayoreo: asNumber(api.precio_mayoreo),
      image,
      category,
      type,
      sizes,
      colors,
      rating: 0,
      reviewsCount: 0,
      isOffer: false,
      stock: variants.reduce((sum, variant) => sum + variant.availableBodega, 0),
      fabric: '',
      embroidery: '',
      reviews: [],
      variantes: variants,
      color_images: api.color_images ?? [],
      department_id: api.department_id,
      manga: api.manga || api.tipo_manga || '',
      colorList,
    };
  }

  private mapVariant(raw: ApiVariante, product: ApiProducto): ProductVariant {
    const qtyBodega = asNumber(raw.qtyBodega ?? raw.qty_bodega);
    const qtyApartado = asNumber(raw.qtyApartado ?? raw.qty_apartado);
    const backendAvailable = raw.availableBodega ?? raw.available_bodega;
    const availableBodega = backendAvailable !== null && backendAvailable !== undefined && Number.isFinite(Number(backendAvailable))
      ? Math.max(0, Number(backendAvailable))
      : Math.max(0, qtyBodega - qtyApartado);
    return {
      id: asNumber(raw.id),
      sku: String(raw.sku ?? ''),
      descripcion: String(raw.descripcion ?? ''),
      precio_ecommerce: asNumber(raw.precio_ecommerce ?? raw.ecommerce_price ?? product.precio_ecommerce ?? product.ecommerce_price),
      precio_publico: asNumber(raw.precio_publico),
      hex: String(raw.hex ?? ''),
      color: String(raw.color ?? '').trim(),
      color_id: asNumber(raw.color_id),
      talla: mapSizeToNumber(raw.talla),
      talla_id: asNumber(raw.talla_id),
      qtyBodega,
      qtyApartado,
      qty_apartado: qtyApartado,
      availableBodega,
      qtyProduccion: asNumber(raw.qtyProduccion),
      qtyPreventa: asNumber(raw.qtyPreventa),
      images_url: raw.images_url ?? [],
    };
  }

  getVariant(product: Product, size: string, color: string): ProductVariant | undefined {
    return product.variantes.find((variant) => variant.talla === mapSizeToNumber(size) && variant.color.toLowerCase() === String(color).trim().toLowerCase());
  }

  readonly availableSizes = computed(() => {
    const set = new Set<string>();
    this.productsForSelectedCategory().forEach((product) => product.variantes.forEach((variant) => {
      if (variant.availableBodega > 0 && variant.talla) set.add(variant.talla);
    }));
    return ['Todos', ...Array.from(set).sort((a, b) => (Number(a) || 999) - (Number(b) || 999) || a.localeCompare(b))];
  });
  readonly availableColors = computed(() => {
    const set = new Set<string>();
    this.productsForSelectedCategory().forEach((product) => product.variantes.forEach((variant) => {
      if (variant.availableBodega > 0 && variant.color) set.add(variant.color);
    }));
    return ['Todos', ...Array.from(set).sort()];
  });
  readonly availableCategories = computed(() => {
    const set = new Set<string>();
    this.masterDepartamentos().forEach((dept) => { const name = String(dept.name || dept.nombre || '').trim(); if (name) set.add(name); });
    this.products().forEach((product) => set.add(product.category));
    return ['Todos', ...Array.from(set).sort()];
  });
  readonly availableMangas = computed(() => {
    const set = new Set<string>();
    this.masterMangas().forEach((manga) => { const name = String(manga.name || manga.nombre || '').trim(); if (name) set.add(name); });
    this.products().forEach((product) => { if (product.manga) set.add(product.manga); });
    return ['Todos', ...Array.from(set).sort()];
  });
  readonly availableTypes = computed(() => ['Todos', ...Array.from(new Set(this.products().map((p) => p.type))).sort()]);

  private productsForSelectedCategory() {
    const category = this.selectedCategory();
    return this.products().filter((product) => category === 'Todos' || product.category === category || (product.department_id && this.masterDepartamentos().some((dept) => dept.id === product.department_id && (dept.name || dept.nombre) === category)));
  }

  readonly filteredProducts = computed(() => this.products().filter((product) => {
    const query = this.searchQuery().trim().toLowerCase();
    const matchesSearch = !query || product.name.toLowerCase().includes(query) || product.description.toLowerCase().includes(query);
    const matchesCategory = this.selectedCategory() === 'Todos' || this.productsForSelectedCategory().includes(product);
    const matchesType = this.selectedType() === 'Todos' || product.type === this.selectedType();
    const matchesSize = this.selectedSize() === 'Todos' || product.variantes.some((v) => v.talla === mapSizeToNumber(this.selectedSize()) && v.availableBodega > 0);
    const matchesColor = this.selectedColor() === 'Todos' || product.variantes.some((v) => v.color.toLowerCase() === this.selectedColor().toLowerCase() && v.availableBodega > 0);
    const matchesManga = this.selectedManga() === 'Todos' || String(product.manga ?? '').toLowerCase() === this.selectedManga().toLowerCase();
    const matchesPrice = product.price <= 0 || product.price <= this.priceRange();
    return matchesSearch && matchesCategory && matchesType && matchesSize && matchesColor && matchesManga && matchesPrice;
  }));

  readonly cartTotalItems = computed(() => this.cart().reduce((sum, item) => sum + item.quantity, 0));
  readonly cartTotalPrice = computed(() => this.cart().reduce((sum, item) => {
    const price = Number(item.unitPrice ?? this.getVariant(item.product, item.selectedSize, item.selectedColor)?.precio_ecommerce ?? item.product.precio_ecommerce ?? 0);
    return sum + (Number.isFinite(price) ? price : 0) * item.quantity;
  }, 0));

  resetFilters() {
    this.searchQuery.set(''); this.selectedCategory.set('Todos'); this.selectedType.set('Todos'); this.selectedSize.set('Todos'); this.selectedColor.set('Todos'); this.selectedManga.set('Todos'); this.priceRange.set(2000);
  }
  setCategory(category: string) { this.selectedCategory.set(category); this.selectedSize.set('Todos'); this.selectedColor.set('Todos'); }

  addToCart(product: Product, quantity = 1, size: string, color: string): boolean {
    const variant = this.getVariant(product, size, color);
    if (!variant) { this.toast.error('La variante seleccionada ya no existe.'); return false; }
    if (variant.precio_ecommerce <= 0) { this.toast.info('Esta prenda tiene precio por consultar y no puede agregarse al carrito.'); return false; }
    if (variant.availableBodega <= 0) { this.toast.warning('La variante seleccionada está agotada.'); return false; }
    const current = this.cart();
    const index = current.findIndex((item) => item.variantId === variant.id);
    const currentQty = index >= 0 ? current[index].quantity : 0;
    const requested = Math.max(1, quantity) + currentQty;
    const nextQty = Math.min(requested, variant.availableBodega);
    if (nextQty < requested) this.toast.warning(`Solo hay ${variant.availableBodega} pieza(s) disponibles de esta variante.`);
    const item: CartItem = {product, variantId: variant.id, quantity: nextQty, selectedSize: variant.talla, selectedColor: variant.color, unitPrice: variant.precio_ecommerce};
    if (index >= 0) {
      const updated = [...current]; updated[index] = item; this.cart.set(updated);
    } else this.cart.set([...current, item]);
    return true;
  }

  removeFromCart(productId: string, size: string, color: string) {
    this.cart.update((items) => items.filter((item) => !(item.product.id === productId && item.selectedSize === size && item.selectedColor === color)));
  }
  updateCartQuantity(productId: string, size: string, color: string, quantity: number) {
    if (quantity <= 0) { this.removeFromCart(productId, size, color); return; }
    this.cart.update((items) => items.map((item) => {
      if (item.product.id !== productId || item.selectedSize !== size || item.selectedColor !== color) return item;
      const variant = this.getVariant(item.product, size, color);
      const max = variant?.availableBodega ?? 0;
      if (!variant || max <= 0) return item;
      const safe = Math.min(quantity, max);
      if (safe < quantity) this.toast.warning(`Solo hay ${max} pieza(s) disponibles de esta variante.`);
      return {...item, quantity: safe, variantId: variant.id, unitPrice: variant.precio_ecommerce};
    }));
  }
  clearCart() { this.cart.set([]); }

  async revalidateCart(showToast = true, forceCatalog = true): Promise<boolean> {
    const loaded = await this.loadProducts(forceCatalog);
    if (!loaded) throw new Error(this.catalogError() || 'No fue posible revalidar el carrito.');
    const next: CartItem[] = [];
    let adjusted = 0;
    let removed = 0;
    for (const old of this.cart()) {
      const product = this.products().find((p) => p.id === old.product.id);
      if (!product) { removed++; continue; }
      const variant = product.variantes.find((v) => v.id === old.variantId) || this.getVariant(product, old.selectedSize, old.selectedColor);
      if (!variant || variant.availableBodega <= 0 || variant.precio_ecommerce <= 0) { removed++; continue; }
      const quantity = Math.min(old.quantity, variant.availableBodega);
      if (quantity !== old.quantity || variant.id !== old.variantId || variant.precio_ecommerce !== old.unitPrice) adjusted++;
      next.push({product, variantId: variant.id, quantity, selectedSize: variant.talla, selectedColor: variant.color, unitPrice: variant.precio_ecommerce});
    }
    this.cart.set(next);
    if (showToast) {
      if (removed) this.toast.warning(`${removed} variante(s) se retiraron del carrito por cambios de disponibilidad o precio.`);
      if (adjusted) this.toast.info(`${adjusted} variante(s) del carrito se actualizaron con la información vigente.`);
    }
    return removed === 0 && adjusted === 0;
  }

  async restoreCartSnapshot(snapshot: CartItem[]): Promise<void> {
    this.cart.set(Array.isArray(snapshot) ? snapshot : []);
    await this.revalidateCart(true);
  }

  toggleWishlist(productId: string) { this.wishlist.update((items) => items.includes(productId) ? items.filter((id) => id !== productId) : [...items, productId]); }
  isInWishlist(productId: string) { return this.wishlist().includes(productId); }
  updateUserProfile(profile: {name: string; email: string; phone: string; address: string; bio: string}) { this.userProfile.set(profile); }

  // Conservado solo para la vista histórica de usuario; checkout Mercado Pago no utiliza ni limpia carrito aquí.
  placeOrder(shippingName: string, phone: string, email: string, address: string, method: Order['paymentMethod'], orderId?: string): Order {
    const order: Order = {id: orderId || '', date: new Date().toLocaleDateString('es-MX'), items: [...this.cart()], total: this.cartTotalPrice(), status: 'Procesando', shippingAddress: address, shippingName, phone, email, paymentMethod: method};
    this.orders.update((items) => [order, ...items]);
    return order;
  }
}
