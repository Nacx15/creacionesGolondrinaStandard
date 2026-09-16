import {RenderMode, ServerRoute} from '@angular/ssr';

// El estado del e-commerce, catálogo y URLs firmadas son dinámicos. SSR en runtime evita
// congelar durante el build un estado active/maintenance/inactive o inventario obsoleto.
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
