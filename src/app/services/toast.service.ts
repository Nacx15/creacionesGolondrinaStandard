import {Injectable, signal} from '@angular/core';

export type ToastType = 'success' | 'info' | 'warning' | 'error';
export interface ToastMessage { id: number; type: ToastType; message: string; }

@Injectable({providedIn: 'root'})
export class ToastService {
  readonly messages = signal<ToastMessage[]>([]);
  private nextId = 1;

  show(message: string, type: ToastType = 'info', duration = 5000) {
    const id = this.nextId++;
    this.messages.update((items) => [...items, {id, type, message}]);
    if (typeof window !== 'undefined') {
      window.setTimeout(() => this.dismiss(id), duration);
    }
  }
  success(message: string) { this.show(message, 'success'); }
  info(message: string) { this.show(message, 'info'); }
  warning(message: string) { this.show(message, 'warning', 6500); }
  error(message: string) { this.show(message, 'error', 7000); }
  dismiss(id: number) { this.messages.update((items) => items.filter((item) => item.id !== id)); }
}
