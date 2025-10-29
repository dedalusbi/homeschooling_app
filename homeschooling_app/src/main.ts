import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { importProvidersFrom, LOCALE_ID } from '@angular/core';
import { IonicStorageModule, Storage } from '@ionic/storage-angular';
import { AuthInterceptor } from './app/core/auth-interceptor';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(withInterceptorsFromDi()), //habilita interceptors baseados em DI
    //Configuração do Ionic Storage
    importProvidersFrom(IonicStorageModule.forRoot()),
    //Disponibiliza o serviço Storage para injeção
    Storage,
    //Registra o AuthInterceptor
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true},
    { provide: LOCALE_ID, useValue: 'pt-BR'}
  ],
});

registerLocaleData(localePt, 'pt-BR')