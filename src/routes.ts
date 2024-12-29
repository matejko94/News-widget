import {Route} from "@angular/router";

export const ROUTES: Route[] = [
    {
        path: 'news',
        loadComponent: () => import('./app/pages/news/news.page'),
        title: 'News'
    },
    {
        path: 'live-reporting',
        loadComponent: () => import('./app/pages/live-reporting/live-reporting.page'),
        title: 'SDG | NEWS | IRCAI SDG OBSERVATORY'
    },
    {
        path: 'sunburst',
        loadComponent: () => import('./app/pages/sunburst/sunburst.page'),
        title: 'Sunburst'
    },
    {
        path: 'radial-policies',
        loadComponent: () => import('./app/pages/radial-policies/radial-policies.page'),
        title: 'Radial Policies'
    }
];
