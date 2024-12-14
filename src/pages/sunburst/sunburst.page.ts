import {Component} from "@angular/core";
import {SunburstChartComponent} from "../../ui/charts/sunburst-chart/sunburst-chart.component";
import {SunburstNode} from "../../ui/charts/sunburst-chart/sunburst-node.interface";
export const TEST_DATA: SunburstNode = {
    name: 'root',
    children: [
        {
            name: 'home',
            children: [
                {
                    name: 'welcome',
                    size: 100
                },
                {
                    name: 'intro',
                    children: [
                        { name: 'getting-started', size: 50 },
                        { name: 'tour', size: 30 },
                        { name: 'faq', size: 20 }
                    ]
                }
            ]
        },
        {
            name: 'product',
            children: [
                {
                    name: 'category1',
                    children: [
                        { name: 'item1-1', size: 40 },
                        { name: 'item1-2', size: 60 },
                        {
                            name: 'item1-3-group',
                            children: [
                                { name: 'item1-3-1', size: 10 },
                                { name: 'item1-3-2', size: 15 },
                                { name: 'item1-3-3', size: 25 }
                            ]
                        }
                    ]
                },
                {
                    name: 'category2',
                    children: [
                        { name: 'item2-1', size: 80 },
                        { name: 'item2-2', size: 10 },
                        {
                            name: 'item2-3-group',
                            children: [
                                { name: 'item2-3-1', size: 5 },
                                { name: 'item2-3-2', size: 5 }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            name: 'search',
            children: [
                {
                    name: 'query',
                    children: [
                        { name: 'term1', size: 50 },
                        { name: 'term2', size: 100 },
                        { name: 'term3', size: 20 },
                        { name: 'term4', size: 5 }
                    ]
                },
                {
                    name: 'filters',
                    children: [
                        { name: 'filter1', size: 60 },
                        { name: 'filter2', size: 40 }
                    ]
                }
            ]
        },
        {
            name: 'account',
            children: [
                {
                    name: 'profile',
                    size: 70
                },
                {
                    name: 'settings',
                    children: [
                        { name: 'privacy', size: 30 },
                        { name: 'notifications', size: 20 }
                    ]
                },
                {
                    name: 'history',
                    children: [
                        { name: 'orders', size: 50 },
                        { name: 'views', size: 10 },
                        {
                            name: 'wishlist-group',
                            children: [
                                { name: 'wishlist1', size: 15 },
                                { name: 'wishlist2', size: 10 },
                                { name: 'wishlist3', size: 5 }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            name: 'other',
            children: [
                { name: 'misc1', size: 25 },
                { name: 'misc2', size: 35 },
                {
                    name: 'misc-group',
                    children: [
                        { name: 'misc3', size: 15 },
                        { name: 'misc4', size: 10 },
                        {
                            name: 'deep-group',
                            children: [
                                { name: 'deep1', size: 5 },
                                {
                                    name: 'deeper-group',
                                    children: [
                                        { name: 'deep2', size: 2 },
                                        { name: 'deep3', size: 2 },
                                        { name: 'deep4', size: 1 }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
};

@Component({
    selector: 'sunburst-page',
    standalone: true,
    imports: [
        SunburstChartComponent
    ],
    styles: `
        :host {
            display: flex;
            justify-items: center;
            align-items: center;
            width: 100%;
            height: 100%;
        }
    `,
    template: `
        <app-sunburst-chart [data]="node"/>
    `
})
export default class SunburstPage {
    public node: SunburstNode = TEST_DATA;
}