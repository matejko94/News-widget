import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { map, Observable } from 'rxjs';
import { SDG_COLORS } from '../../../../configuration/colors/policy/sdg.colors';
import { ScienceService } from '../../domain/science/service/science.service';
import { TopTopicsPerYear } from '../../domain/science/types/topic-timespan.interface';
import { TimelineChartComponent, TimelineRow } from '../../ui/charts/timeline/timeline-chart.component';
import { SpinnerComponent } from '../../ui/components/spinner/spinner.component';
import { BasePage } from '../base.page';

@Component({
    selector: 'timeline-page',
    standalone: true,
    imports: [
        AsyncPipe,
        TimelineChartComponent,
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
        @if (data$ | async; as data) {
            @if (data?.length) {
                <app-timeline-chart [data]="data" [legend]="legend"/>
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
export default class TimelinePage extends BasePage implements OnInit {
    private scienceService = inject(ScienceService);

    public data$!: Observable<TimelineRow[]>;
    public sdgColors = SDG_COLORS.colors;
    public legend = this.sdgColors.map((color, index) => ({ label: `SDG ${ index + 1 }`, color }));

    public override ngOnInit() {
        super.ngOnInit();

        this.data$ = this.setupData();
    }

    private setupData(): Observable<TimelineRow[]> {
        const sdgValue = this.sdg();
        return this.scienceService.getTopTopicsPerYear(sdgValue ? +sdgValue : undefined, 15).pipe(
            map(years => this.mapTopicsToRows(years))
        );
    }

    private mapTopicsToRows(years: TopTopicsPerYear[]): TimelineRow[] {
        const topicTopYears = new Map<string, number[]>();
        const topicSdg = new Map<string, number>();

        years.forEach(({ year, topics }) => {
            topics.forEach(({ key: topic, sdg }) => {
                if (!topicTopYears.has(topic)) {
                    topicTopYears.set(topic, []);
                }

                if (!topicSdg.has(topic)) {
                    topicSdg.set(topic, +(sdg.split(' ')[1]));
                }

                topicTopYears.get(topic)!.push(year);
            });
        });

        return Array.from(topicTopYears.entries())
            .map(([ name, topYears ]) => ({
                name,
                sdg: topicSdg.get(name)!,
                years: topYears.sort(),
                color: this.sdgColors[topicSdg.get(name)! - 1]
            }));
    }
}
