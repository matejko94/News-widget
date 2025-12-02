import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { combineLatest, map, Observable, switchMap } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { NEWS_CATEGORIES_COLORS } from '../../../../configuration/colors/news/categories.colors';
import { NewsService } from '../../domain/news/service/news.service';
import { TopicDto } from '../../domain/news/types/topic.dto';
import { SunburstChartComponent, SunburstNode } from '../../ui/charts/sunburst-chart/sunburst-chart.component';
import { MenuComponent } from '../../ui/components/menu/menu.component';
import { SpinnerComponent } from '../../ui/components/spinner/spinner.component';
import { BasePage } from '../base.page';

@Component({
    selector: 'sunburst-page',
    standalone: true,
    imports: [
        AsyncPipe,
        SunburstChartComponent,
        MenuComponent,
        SpinnerComponent
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
        @if (topicOptions().length) {
            <app-menu queryParam="topic" label="Select topic" [options]="topicOptions()" showClear class="absolute right-3 top-14 z-10"/>
        }

        @if (node$ | async; as node) {
            @if (node.children?.length) {
                <app-sunburst-chart [data]="node" [colors]="colors" class="block h-full pt-16 md:pt-8"/>
            } @else {
                <div class="flex items-center justify-center w-full h-full text-2xl text-gray-400">
                    No data available
                </div>
            }
        } @else {
            <app-spinner/>
        }
    `
})
export default class SunburstPage extends BasePage implements OnInit {
    private newsService = inject(NewsService);

    public node$!: Observable<SunburstNode | undefined>;
    public colors = NEWS_CATEGORIES_COLORS.colors;

    public override ngOnInit() {
        super.ngOnInit();

        this.node$ = this.setupNodes();
    }

    private setupNodes(): Observable<SunburstNode | undefined> {
        const sdg$ = toObservable(this.sdg, { injector: this.injector });
        const pilot$ = toObservable(this.pilot, { injector: this.injector });

        return combineLatest([
            this.selectedTopic$,
            sdg$,
            pilot$
        ]).pipe(
            switchMap(([topics, sdg, pilot]) => {
                console.log('Sunburst setupNodes - topics:', topics, 'sdg:', sdg, 'pilot:', pilot);
                const wikiConcepts = sdg === '0' ? ['Landslide', 'Flood', 'Debris'] : (topics?.wikiConcepts || []);
                console.log('Sunburst wikiConcepts:', wikiConcepts);
                
                if (!wikiConcepts || wikiConcepts.length === 0) {
                    console.warn('No wikiConcepts available for sunburst');
                    return new Observable<TopicDto[]>(subscriber => {
                        subscriber.next([]);
                        subscriber.complete();
                    }).pipe(
                        map(topics => topics ? this.mapToNode(topics) : undefined)
                    );
                }
                
                return this.newsService.getTopics(wikiConcepts, pilot || undefined).pipe(
                    map(topics => {
                        console.log('Sunburst received topics:', topics);
                        return topics ? this.mapToNode(topics) : undefined;
                    })
                );
            })
        );
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

    protected readonly top = top;
}
