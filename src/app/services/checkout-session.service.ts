import {Injectable} from '@angular/core';
import type {CartItem} from '../components/store';

const KEY = 'creaciones_golondrina_checkout_session_v1';

export interface CheckoutSession {
  saleId: string;
  preferenceId: string;
  initPoint: string;
  orderStatusUrl: string;
  reservationExpiresAt?: string | null;
  totals: { subtotal: number; shippingCost: number; total: number; };
  cartSnapshot: CartItem[];
  createdAt: string;
}

@Injectable({providedIn: 'root'})
export class CheckoutSessionService {
  save(session: CheckoutSession) {
    if (typeof sessionStorage === 'undefined') return;
    sessionStorage.setItem(KEY, JSON.stringify(session));
  }
  get(): CheckoutSession | null {
    if (typeof sessionStorage === 'undefined') return null;
    try {
      const raw = sessionStorage.getItem(KEY);
      return raw ? JSON.parse(raw) as CheckoutSession : null;
    } catch { return null; }
  }
  clear() {
    if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem(KEY);
  }
}
