import { Route } from '@angular/router';

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
        path: 'news/sunburst',
        loadComponent: () => import('./app/pages/sunburst/sunburst.page'),
        title: 'Sunburst'
    },
    {
        path: 'education/radial',
        loadComponent: () => import('./app/pages/radial-policies/radial-policies.page'),
        title: 'Radial Policies'
    },
    {
        path: 'policy/heatmap',
        loadComponent: () => import('./app/pages/bar-code/bar-code.page'),
        title: 'Barcode'
    },
    {
        path: 'policy/timeline',
        loadComponent: () => import('./app/pages/timeline/timeline.page'),
        title: 'Policy Timeline'
    },
    {
        path: 'policy/radar',
        loadComponent: () => import('./app/pages/radar/radar.page'),
        title: 'Policy Radar'
    },
    {
        path: 'indicator/bubbles',
        loadComponent: () => import('./app/pages/bubble/bubble.page'),
        title: 'Bubble'
    },
    {
        path: 'news/intensity',
        loadComponent: () => import('./app/pages/intensity/intensity.page'),
        title: 'Intensity'
    },
    {
        path: 'innovations/collaboration',
        loadComponent: () => import('./app/pages/collaboration/collaboration.page'),
        title: 'Collaboration'
    },
    {
        path: 'education/links',
        loadComponent: () => import('./app/pages/links/links.page'),
        title: 'Links'
    }
];
