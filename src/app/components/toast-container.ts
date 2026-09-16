import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {ToastService, ToastType} from '../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed top-5 right-5 z-[100] w-[calc(100%-2.5rem)] max-w-sm space-y-3" aria-live="polite">
      @for (message of toast.messages(); track message.id) {
        <div class="bg-white border shadow-xl rounded-2xl p-4 flex gap-3 items-start" [class]="borderClass(message.type)">
          <mat-icon [class]="iconClass(message.type)">{{ icon(message.type) }}</mat-icon>
          <p class="text-sm text-gray-700 leading-relaxed flex-1">{{ message.message }}</p>
          <button type="button" class="text-gray-400 hover:text-gray-700" (click)="toast.dismiss(message.id)" aria-label="Cerrar notificación">
            <mat-icon class="text-lg">close</mat-icon>
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastContainer {
  readonly toast = inject(ToastService);
  borderClass(type: ToastType) {
    return type === 'error' ? 'border-rose-200' : type === 'warning' ? 'border-amber-200' : type === 'success' ? 'border-emerald-200' : 'border-sky-200';
  }
  iconClass(type: ToastType) {
    return type === 'error' ? 'text-rose-600' : type === 'warning' ? 'text-amber-600' : type === 'success' ? 'text-emerald-600' : 'text-sky-600';
  }
  icon(type: ToastType) {
    return type === 'error' ? 'error_outline' : type === 'warning' ? 'warning_amber' : type === 'success' ? 'check_circle' : 'info';
  }
}
