import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { initializeApp, getApps } from 'firebase/app';
import { environment } from './environments/environment';
import { FullCalendarModule } from '@fullcalendar/angular';

// Ensure Firebase app is initialized before Angular bootstraps.
if (!getApps().length) {
  try {
    initializeApp(environment as any);
    // console.log('Firebase initialized');
  } catch (e) {
    console.warn('Firebase initialization failed', e);
  }
}

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
