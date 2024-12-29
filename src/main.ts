import {bootstrapApplication} from "@angular/platform-browser";
import {provideHttpClient, withJsonpSupport} from "@angular/common/http";
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import {AppComponent} from "./app.component";
import {provideRouter, withComponentInputBinding} from "@angular/router";
import {ROUTES} from "./routes";
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
        })
    ]
}).catch(err => console.error(err));
