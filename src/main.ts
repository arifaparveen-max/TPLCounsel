import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';

bootstrapApplication(App, {
  ...appConfig,                    // Spread appConfig first
  providers: [
    ...(appConfig.providers || []), // Keep existing providers from appConfig
    provideRouter(routes),
    provideAnimations(),            // ← Animations for Owl Carousel
  ]
})
  .catch((err) => console.error(err));