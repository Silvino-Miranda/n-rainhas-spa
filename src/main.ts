import { provideZonelessChangeDetection, ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { ThemeService } from './app/core/theme/theme.service';
import { PersistenceService } from './app/data-access/persistence.service';

const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    provideAnimationsAsync(),
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: (theme: ThemeService, persistence: PersistenceService) => async () => {
        await persistence.initialize();
        theme.initialize();
      },
      deps: [ThemeService, PersistenceService]
    }
  ]
};

bootstrapApplication(AppComponent, appConfig).catch(err => console.error(err));
