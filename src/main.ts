import { provideHttpClient, withJsonpSupport } from '@angular/common/http';
import { provideAppInitializer } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import { AppComponent } from './app.component';
import { ROUTES } from './routes';
import { MyPreset } from './styles/theme/theme';

bootstrapApplication(AppComponent, {
    providers: [
        provideHttpClient(withJsonpSupport()),
        provideRouter(ROUTES, withComponentInputBinding()),
        provideAnimationsAsync(),
        providePrimeNG({
            theme: {
                preset: MyPreset,
                options: {
                    darkModeSelector: false,
                    cssLayer: {
                        name: 'primeng',
                        order: 'tailwind-base, primeng, tailwind-utilities'
                    }
                }
            }
        }),
        provideAppInitializer(() => console.log('Version: 1.0.3'))
    ]
}).catch(err => console.error(err));
