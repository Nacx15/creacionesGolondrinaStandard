import {ChangeDetectionStrategy, Component, input} from '@angular/core';

@Component({
  selector: 'app-logo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="classes()" class="flex flex-col items-center justify-center text-center">
      <svg [attr.height]="height()" [attr.width]="width()" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg" class="max-w-full">
        <!-- Curved Path for CREACIONES text -->
        <path id="curve" d="M120 180 Q250 110 380 180" fill="transparent" />
        
        <text class="font-serif-brand tracking-widest text-[36px]" fill="#E61C71" font-weight="600">
          <textPath href="#curve" startOffset="50%" text-anchor="middle">
            CREACIONES
          </textPath>
        </text>

        <!-- Golden/Yellow Mayan/Classic Arch Building in the Middle -->
        <!-- Pillars -->
        <rect x="195" y="195" width="16" height="75" rx="1" fill="#F6C11D" />
        <rect x="289" y="195" width="16" height="75" rx="1" fill="#F6C11D" />
        <!-- Pillar bases -->
        <rect x="190" y="260" width="26" height="10" rx="2" fill="#E61C71" />
        <rect x="284" y="260" width="26" height="10" rx="2" fill="#E61C71" />
        <!-- Pillar tops / capitals -->
        <rect x="191" y="190" width="24" height="6" rx="1" fill="#F6C11D" />
        <rect x="285" y="190" width="24" height="6" rx="1" fill="#F6C11D" />
        <!-- Archway curvature -->
        <path d="M211 195 C211 155, 289 155, 289 195" stroke="#F6C11D" stroke-width="4" fill="none" />
        <path d="M205 188 L295 188" stroke="#F6C11D" stroke-width="3" />
        <path d="M195 182 L305 182" stroke="#F6C11D" stroke-width="2" />
        
        <!-- Main Brand Text: Golondrina -->
        <text x="250" y="325" text-anchor="middle" class="font-serif-brand text-[72px]" fill="#E61C71" font-weight="bold">
          Golondrina
        </text>

        <!-- Accent lines flanking the text -->
        <line x1="25" y1="290" x2="160" y2="290" stroke="#F6C11D" stroke-width="3" />
        <line x1="340" y1="290" x2="475" y2="290" stroke="#F6C11D" stroke-width="3" />

        <!-- Swallow (Golondrina) Flying Bird with Flowers & Leaves below -->
        <g transform="translate(185, 335)">
          <!-- Leaf stems in green -->
          <path d="M30 65 Q 15 50, 0 70" stroke="#10B981" stroke-width="2.5" stroke-linecap="round" fill="none" />
          <path d="M30 65 Q 45 55, 60 75" stroke="#10B981" stroke-width="2.5" stroke-linecap="round" fill="none" />
          <!-- Little leaves -->
          <path d="M10 58 Q 5 50, 15 50 Z" fill="#10B981" />
          <path d="M48 62 Q 55 52, 45 50 Z" fill="#10B981" />
          
          <!-- Flower behind the bird -->
          <circle cx="65" cy="45" r="14" fill="#FFAEC9" opacity="0.85" />
          <circle cx="65" cy="45" r="10" fill="#E61C71" opacity="0.6" />
          <circle cx="65" cy="45" r="4" fill="#F6C11D" />

          <!-- Replicating the elegant flying Swallow (Golondrina) in Pink/Magenta -->
          <!-- Main Body and Head -->
          <path d="M65 40 C75 35, 95 40, 100 50 C95 55, 80 50, 65 40" fill="#E61C71" />
          <!-- Tail feathers -->
          <path d="M65 40 C55 35, 30 50, 20 60 C32 55, 52 48, 65 40" fill="#E61C71" />
          <path d="M65 40 C52 38, 25 65, 15 85 C28 72, 50 55, 65 40" fill="#E61C71" />
          <!-- Wings -->
          <!-- Left Wing (sweeping back/up) -->
          <path d="M72 41 C75 25, 65 5, 55 -5 C52 10, 58 25, 72 41" fill="#E61C71" />
          <path d="M75 42 C78 28, 70 12, 63 3 C61 15, 65 28, 75 42" fill="#E61C71" />
          <!-- Right Wing (pointing down/forward) -->
          <path d="M78 45 C88 55, 95 70, 92 88 C85 75, 80 60, 78 45" fill="#E61C71" />
          <path d="M79 43 C91 50, 102 62, 105 78 C96 68, 88 56, 79 43" fill="#E61C71" />

          <!-- Beak/Head dot -->
          <circle cx="101" cy="51" r="2.5" fill="#E61C71" />
          <!-- Little floral blooms -->
          <circle cx="45" cy="78" r="7" fill="#FFAEC9" />
          <circle cx="45" cy="78" r="2" fill="#F6C11D" />
        </g>
      </svg>
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
}
