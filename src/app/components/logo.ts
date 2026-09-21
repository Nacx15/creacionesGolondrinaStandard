import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {environment} from '../../environments/environment';

@Component({
  selector: 'app-logo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="classes()" class="flex flex-col items-center justify-center text-center">
      <img
        [src]="logoUrl"
        alt="Creaciones Golondrina"
        [attr.height]="height()"
        [attr.width]="width()"
        class="max-w-full object-contain"
        referrerpolicy="no-referrer"
      />
    </div>
  `,
  styles: `
    :host {
      display: inline-block;
    }
  `
})
export class Logo {
  readonly height = input<string>('120');
  readonly width = input<string>('120');
  readonly classes = input<string>('');
  readonly logoUrl = environment.brandImages.logo;
}
