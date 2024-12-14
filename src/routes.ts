import {Route} from "@angular/router";

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
    {
        path: 'sunburst',
        loadComponent: () => import('./pages/sunburst/sunburst.page'),
        title: 'Sunburst'
    },
    {
        path: 'radial-regions',
        loadComponent: () => import('./pages/radial-regions/radial-regions.page'),
        title: 'Radial Regions'
    }
];
