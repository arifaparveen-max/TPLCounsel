import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'act-details-listing/:id',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => [{ id: '1' }],
  },
  {
    path: 'act-section-dtls-listing/:id',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => [{ id: '1' }],
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
