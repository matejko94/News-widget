import { AsyncPipe } from '@angular/common';
import { Component, inject, input, OnInit, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { combineLatest, filter, map, Observable, pairwise, switchMap, tap } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { getColorByCountryCode } from '../../../../configuration/countries/countries';
import { loadingMap } from '../../common/utility/loading-map';
import { IndicatorIntersectionTimeline } from '../../domain/indicators/types/indicator-intersection-timeline.interface';
import { IndicatorsIntersections } from '../../domain/indicators/types/indicator-intersection.interface';
import { ScienceService } from '../../domain/science/service/science.service';
import { EvolutionLinkDto } from '../../domain/science/types/evolution-link.dto';
import { TopTopicsPerYear } from '../../domain/science/types/topic-timespan.interface';
import { BubbleChartComponent, BubbleChartData } from '../../ui/charts/bubble-chart/bubble-chart.component';
import { GraphData, GraphLink, GraphNode, NetworkGraphComponent } from '../../ui/charts/evolution-chart/evolution-chart.component';
import { LineChartComponent, LineChartData } from '../../ui/charts/line-chart/line-chart.component';
import { MenuComponent } from '../../ui/components/menu/menu.component';
import { YearSliderComponent } from '../../ui/components/year-slider/year-slider.component';
import { BasePage } from '../base.page';

@Component({
    selector: 'evolution-page',
    standalone: true,
    imports: [
        LineChartComponent,
        YearSliderComponent,
        BubbleChartComponent,
        MenuComponent,
        LineChartComponent,
        LineChartComponent,
        BubbleChartComponent,
        LineChartComponent,
        AsyncPipe,
        NetworkGraphComponent,
    ],
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
            height: 150%;
        }
    `,
    template: `
        <div class="w-full">
            <app-year-slider [min]="2000" [max]="2025" autoIncrement/>
        </div>


        <div class="flex flex-col gap-10 justify-start w-full relative">
            <app-menu class="absolute top-0 right-10 z-20" queryParam="topic" label="Topic" [options]="topicOptions()"/>

            @if (data$ | async; as data) {
                <app-network-graph [data]="data"/>
            }
        </div>
    `
})
export default class EvolutionPage extends BasePage implements OnInit {
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
            filter(([ year, topic ]) => !!year && !!topic),
            loadingMap(([ year, topic ]) => this.getData(+this.sdg(), topic!, +year!)),
        );
    }

    public override ngOnInit() {
        super.ngOnInit();

        if (!this.topic()) {
            this.setQueryParam('topic', this.topicOptions()[0].value);
        }
    }

    private getData(sdg: number, topic: string, year: number): Observable<GraphData> {
        return this.scienceService.getTopicEvolution(sdg, topic, year).pipe(
            map(data => this.mapGraphData(topic, data))
        );
    }

    private mapGraphData(selectedTopic: string, intersections: EvolutionLinkDto[]): GraphData {
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

    private mapNodes(intersections: EvolutionLinkDto[], activeTopic: string): GraphNode[] {
        return intersections
            .filter(topic => !topic.concept_display_name.includes(this.separator))
            .map(topic => ({
                id: topic.concept_display_name,
                color: this.getNodeColor(activeTopic, topic.concept_display_name),
                radius: topic.article_count
            }));
    }

    private getNodeColor(activeTopic: string, topic: string): string {
        if (activeTopic === topic) {
            return 'red';
        }

        return this.previousNodes.has(topic) ? 'blue' : 'green';
    }
}
