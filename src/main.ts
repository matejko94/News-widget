import { bootstrapApplication } from "@angular/platform-browser";
import { provideHttpClient, withJsonpSupport } from "@angular/common/http";
import { provideAnimations } from "@angular/platform-browser/animations";
import { AppComponent } from "./app.component";
import { provideRouter, Route, withComponentInputBinding } from "@angular/router";

export const ROUTES: Route[] = [
    {
        path: 'news',
        loadComponent: () => import('./pages/news/news.page'),
        title: 'News'
    },
    {
        path: 'live-reporting',
        loadComponent: () => import('./pages/live-reporting/live-reporting.page'),
        title: 'SDG | NEWS | IRCAI SDG OBSERVATORY'
    },
];

bootstrapApplication(AppComponent, {
    providers: [
        provideHttpClient(withJsonpSupport()),
        provideRouter(ROUTES, withComponentInputBinding()),
        provideAnimations(),
    ]
}).catch(err => console.error(err));
