import { AsyncPipe } from '@angular/common';
import { Component, inject, input, OnInit } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { combineLatest, filter, map, Observable, switchMap } from 'rxjs';
import { ScienceService } from '../../domain/science/service/science.service';
import { EvolutionLinkDto } from '../../domain/science/types/evolution-link.dto';
import { GraphData, GraphNode, NetworkChartComponent } from '../../ui/charts/network-chart/network-chart.component';
import { MenuComponent } from '../../ui/components/menu/menu.component';
import { YearSliderComponent } from '../../ui/components/year-slider/year-slider.component';
import { BasePage } from '../base.page';

@Component({
    selector: 'evolution-page',
    standalone: true,
    imports: [
        YearSliderComponent,
        MenuComponent,
        AsyncPipe,
        NetworkChartComponent,
    ],
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
            height: 100%;
        }
    `,
    template: `
        <div class="w-full">
            <app-year-slider [min]="2000" [max]="2025" autoIncrement/>
        </div>


        <div class="flex flex-col gap-10 justify-start flex-1 w-full relative">
            @if (topicOptions().length) {
                <app-menu class="absolute top-0 right-10 z-20" queryParam="topic" label="Topic"
                          [options]="topicOptions()" showClear/>
            }

            @if (data$ | async; as data) {
                @if (data.nodes.length) {
                    <app-network-chart class="h-[150%]" [data]="data"/>
                } @else {
                    <div class="flex items-center justify-center flex-1 text-2xl text-gray-400">
                        No data available
                    </div>
                }
            }
        </div>
    `
})
export default class EvolutionPage extends BasePage {
    private scienceService = inject(ScienceService);

    public year = input<string>();
    public data$!: Observable<GraphData | undefined>;
    public previousTopic: string | undefined;
    public previousNodes = new Set<string>();
    private separator = ' ^ ';

    constructor() {
        super();

        this.data$ = combineLatest([
            toObservable(this.year),
            toObservable(this.topic)
        ]).pipe(
            filter(([ year ]) => !!year),
            switchMap(([ year, topic ]) => this.getData(+this.sdg(), topic, +year!)),
        );
    }

    private getData(sdg: number, topic: string | undefined, year: number): Observable<GraphData> {
        return this.scienceService.getTopicEvolution(sdg, topic, year).pipe(
            map(data => this.mapGraphData(topic, data))
        );
    }

    private mapGraphData(selectedTopic: string | undefined, intersections: EvolutionLinkDto[]): GraphData {
        if (selectedTopic !== this.previousTopic) {
            this.previousNodes.clear();
        }

        this.previousTopic = selectedTopic;

        const nodes = this.mapNodes(intersections, selectedTopic);
        this.previousNodes = new Set(nodes.map(node => node.id));

        const links = intersections
            .filter(topic => topic.concept_display_name.includes(this.separator))
            .map(topic => ({
                source: topic.concept_display_name.split(this.separator)[0],
                target: topic.concept_display_name.split(this.separator)[1],
                articles: topic.article_count
            }))
            .filter(({ source, target }) => this.previousNodes.has(source) && this.previousNodes.has(target))
            .map(({ source, target, articles }) => ({ source, target, weight: +articles }));

        return { nodes, links };
    }

    private mapNodes(intersections: EvolutionLinkDto[], activeTopic: string | undefined): GraphNode[] {
        return intersections
            .filter(topic => !topic.concept_display_name.includes(this.separator))
            .map(topic => ({
                id: topic.concept_display_name,
                color: this.getNodeColor(activeTopic, topic.concept_display_name),
                radius: topic.article_count
            }));
    }

    private getNodeColor(activeTopic: string | undefined, topic: string): string {
        if (activeTopic?.toLowerCase() === topic.toLowerCase()) {
            return 'red';
        }

        return this.previousNodes.has(topic) ? 'blue' : 'green';
    }
}
