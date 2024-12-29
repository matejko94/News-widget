import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit, Signal } from '@angular/core';
import { map, Observable, switchMap, tap } from 'rxjs';
import { NEWS_CATEGORIES_COLORS } from '../../../../configuration/colors/news/categories.colors';
import { Topic } from '../../domain/configuration/types/topic.interface';
import { NewsService } from '../../domain/news/service/news.service';
import { TopicDto } from '../../domain/news/types/topic.dto';
import {SunburstChartComponent} from "../../ui/charts/sunburst-chart/sunburst-chart.component";
import {SunburstNode} from "../../ui/charts/sunburst-chart/sunburst-node.interface";
import { TopicMenuComponent } from '../../ui/topic-menu/topic-menu.component';
import { BasePage } from '../base.page';
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
        SunburstChartComponent,
        AsyncPipe,
        TopicMenuComponent
    ],
    styles: `
        :host {
            position: relative;
            display: flex;
            justify-items: center;
            align-items: center;
            width: 100%;
            height: 100%;
        }
    `,
    template: `
        <app-topic-menu [options]="topicOptions()" class="absolute right-6 top-6 z-10"/>

        @if (node$ | async; as node) {
            @if (node.children?.length) {
                <app-sunburst-chart [data]="node" [colors]="colors"/>
            } @else {
                <div class="flex items-center justify-center w-full h-full text-2xl text-gray-400">
                    No data available
                </div>
            }
        }
    `
})
export default class SunburstPage extends BasePage implements OnInit {
    private newsService = inject(NewsService);

    public node$!: Observable<SunburstNode>;
    public colors = NEWS_CATEGORIES_COLORS.colors;

    public override ngOnInit() {
        super.ngOnInit();

        this.node$ = this.setupNodes();
    }

    private setupNodes(): Observable<SunburstNode> {
        return this.selectedTopic$.pipe(
            switchMap(topics => this.newsService.getTopics(topics.wikiConcepts)),
            map(topics => this.mapToNode(topics)),
            tap(topics => {
                console.log(topics);
            })
        )
    }

    private mapToNode(topics: TopicDto[]): SunburstNode {
        const root: SunburstNode = this.createNode("root");
        topics.forEach(topic => this.addTopicToHierarchy(root, topic));

        console.log(root);
        return root;
    }

    private addTopicToHierarchy(root: SunburstNode, topic: TopicDto) {
        const path = topic.label.split("/");
        let currentNode = root;

        path.forEach((segment, index) => {
            currentNode = this.findOrCreateChild(currentNode, segment);

            if (index === path.length - 1) {
                currentNode.size = topic.count;
                delete currentNode.children;
            }
        });
    };

    private findOrCreateChild(parent: SunburstNode, name: string): SunburstNode {
        if (!parent.children) {
            parent.children = [];
        }

        let child = parent.children.find(node => node.name === name);

        if (!child) {
            child = this.createNode(name);
            parent.children.push(child);
        }

        return child;
    };

    private createNode(name: string): SunburstNode {
        return {
            name,
            children: [],
        };
    }
}
