import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { map, Observable } from 'rxjs';
import { SCIENCE_TIMELINE_COLORS } from '../../../../configuration/colors/science/science-timeline.colors';
import { ScienceService } from '../../domain/science/service/science.service';
import { TopTopicsPerYear } from '../../domain/science/types/topic-timespan.interface';
import { TimelineChartComponent, TimelineRow } from '../../ui/charts/timeline/timeline-chart.component';
import { BasePage } from '../base.page';

@Component({
    selector: 'timeline-page',
    standalone: true,
    imports: [
        AsyncPipe,
        TimelineChartComponent
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
        @if (data$ | async; as data) {
            @if (data?.length) {
                <app-timeline-chart [data]="data"/>
            } @else {
                <div class="flex items-center justify-center w-full h-full text-2xl text-gray-400">
                    No data available
                </div>
            }
        }
    `
})
export default class TimelinePage extends BasePage implements OnInit {
    private scienceService = inject(ScienceService);

    public data$!: Observable<TimelineRow[]>;
    public colors = SCIENCE_TIMELINE_COLORS.colors;

    public override ngOnInit() {
        super.ngOnInit();

        this.data$ = this.setupData();
    }

    private setupData(): Observable<TimelineRow[]> {
        return this.scienceService.getTopTopicsPerYear(+this.sdg(), 15).pipe(
            map(years => this.mapTopicsToRows(years))
        );
    }

    private mapTopicsToRows(years: TopTopicsPerYear[]): TimelineRow[] {
        const topicTopYears = new Map<string, number[]>();
        console.log(years);

        years.forEach(({ year, topics }) => {
            topics.forEach(({ key: topic }) => {
                if (!topicTopYears.has(topic)) {
                    topicTopYears.set(topic, []);
                }

                topicTopYears.get(topic)!.push(year);
            });
        });

        return Array.from(topicTopYears.entries())
            .map(([ name, topYears ], index) => ({
                name,
                years: topYears.sort(),
                color: this.colors[index % this.colors.length]
            }));
    }
}
