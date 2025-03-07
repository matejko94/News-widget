import { Route } from '@angular/router';

export const ROUTES: Route[] = [
    {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./app/pages/landing/landing.page'),
    },
    {
        path: 'live-reporting',
        loadComponent: () => import('./app/pages/live-reporting/live-reporting.page'),
        title: 'SDG | NEWS | IRCAI SDG OBSERVATORY'
    },
    {
        path: 'news',
        loadComponent: () => import('./app/pages/news/news.page'),
        title: 'SDG News Categories'
    },
    {
        path: 'news/sunburst',
        loadComponent: () => import('./app/pages/sunburst/sunburst.page'),
        title: 'Sunburst'
    },
    {
        path: 'education/radial',
        loadComponent: () => import('./app/pages/radial-policies/radial-policies.page'),
        title: 'Education SDG Coverage'
    },
    {
        path: 'policy/heatmap',
        loadComponent: () => import('./app/pages/bar-code/bar-code.page'),
        title: 'Policy SDG Barcode'
    },
    {
        path: 'policy/timeline',
        loadComponent: () => import('./app/pages/timeline/timeline.page'),
        title: 'Science Trends Timeline'
    },
    {
        path: 'indicator/bubbles',
        loadComponent: () => import('./app/pages/bubble/bubble.page'),
        title: 'SDG Indicator Bubbles'
    },
    {
        path: 'news/intensity',
        loadComponent: () => import('./app/pages/intensity/intensity.page'),
        title: 'SDG News Intensity'
    }, // TODO: remove default topic (waiting for API to remove it from required)
    {
        path: 'innovations/collaboration',
        loadComponent: () => import('./app/pages/collaboration/collaboration.page'),
        title: 'SDG Innovation Collaborations'
    }, // TODO: fix chart tooltip
    {
        path: 'science/evolution',
        loadComponent: () => import('./app/pages/evolution/evolution.page'),
        title: 'Science Concept Evolution'
    },
    {
        path: 'education/links',
        loadComponent: () => import('./app/pages/links/links.page'),
        title: 'Education Resources Whitespace'
    }, // TODO: integrate API (can not use current API data)
    {
        path: 'innovations/relations',
        loadComponent: () => import('./app/pages/innovations/innovations.page'),
        title: 'Innovation SDG Relations' // TODO: fix tooltip
    },
    {
        path: 'policy/radar',
        loadComponent: () => import('./app/pages/radar/radar.page'),
        title: 'Policy SDG Radar'
    },
    {
        path: '**',
        redirectTo: ''
    }
];
