import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { initializeApp, getApps } from 'firebase/app';
import { environment } from '../environments/environment';

// Ensure Firebase is initialized during server-side rendering builds
if (!getApps().length) {
  try {
    initializeApp(environment as any);
  } catch (e) {
    // ignore server initialization errors during build
  }
}

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes))
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
