import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { NEWS_CATEGORIES_COLORS } from '../../../../configuration/colors/news/categories.colors';
import { NewsService } from '../../domain/news/service/news.service';
import { TopicDto } from '../../domain/news/types/topic.dto';
import { SunburstChartComponent } from '../../ui/charts/sunburst-chart/sunburst-chart.component';
import { SunburstNode } from '../../ui/charts/sunburst-chart/sunburst-node.interface';
import { TopicMenuComponent } from '../../ui/topic-menu/topic-menu.component';
import { BasePage } from '../base.page';

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
        <app-topic-menu [options]="topicOptions()" class="absolute right-3 top-14 z-10"/>

        @if (node$ | async; as node) {
            @if (node.children?.length) {
                <app-sunburst-chart [data]="node" [colors]="colors" class="block h-full pt-16 md:pt-8"/>
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
        )
    }

    private mapToNode(topics: TopicDto[]): SunburstNode {
        const root: SunburstNode = this.createNode('root');
        topics.forEach(topic => this.addTopicToHierarchy(root, topic));
        return root;
    }

    private addTopicToHierarchy(root: SunburstNode, topic: TopicDto) {
        const path = topic.label.split('/');
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
