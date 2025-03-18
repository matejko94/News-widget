import { AsyncPipe } from '@angular/common';
import { Component, inject, input, OnInit, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { combineLatest, filter, map, Observable, switchMap } from 'rxjs';
import { getColorByCountryCode } from '../../../../configuration/countries/countries';
import { IndicatorsService } from '../../domain/indicators/service/indicators.service';
import { IndicatorIntersectionTimeline } from '../../domain/indicators/types/indicator-intersection-timeline.interface';
import { IndicatorsIntersections } from '../../domain/indicators/types/indicator-intersection.interface';
import { BubbleChartComponent, BubbleChartData } from '../../ui/charts/bubble-chart/bubble-chart.component';
import { LineChartComponent, LineChartData } from '../../ui/charts/line-chart/line-chart.component';
import { MenuComponent } from '../../ui/components/menu/menu.component';
import { YearSliderComponent } from '../../ui/components/year-slider/year-slider.component';
import { BasePage } from '../base.page';

@Component({
    selector: 'bubble-page',
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
            <app-year-slider [min]="2010" [max]="2025" autoIncrement/>
        </div>

        <div class="flex justify-between items-center w-full max-w-3xl mx-auto mb-5 gap-4">
            <app-menu class="w-1/3" queryParam="paramX" label="Indicator X" [options]="indicatorOptions()"/>
            <app-menu class="w-1/3" queryParam="paramY" label="Indicator Y" [options]="indicatorOptions()"/>
            <app-menu class="w-1/3" queryParam="paramZ" label="Indicator Z" [options]="indicatorOptions()"/>
        </div>

        @let bubbleData = bubbleData$ | async;
        @let lineData = lineData$ | async;

        @if (bubbleData && lineData) {
            <div class="flex flex-col gap-10 justify-start w-full px-10">
                @if (bubbleData.length) {
                    <app-bubble-chart class="aspect-[2/1]" [data]="bubbleData"
                                      [xAxisLabel]="paramX()!"
                                      [yAxisLabel]="paramY()!"
                                      [zAxisLabel]="paramZ()!"
                    />
                } @else {
                    <div class="flex items-center justify-center w-full py-32 text-2xl text-gray-400">
                        No bubble chart data available
                    </div>
                }

                @if (lineData.length) {
                    <app-line-chart class="aspect-[2/1]" [data]="lineData"
                                    xAxisLabel="Year"
                                    yAxisLabel="Country"
                                    groupLabel="Indicator"
                    />
                } @else {
                    <div class="flex items-center justify-center w-full py-32 text-2xl text-gray-400">
                        No line chart data available
                    </div>
                }
            </div>
        }
    `
})
export default class BubblePage extends BasePage implements OnInit {
    private indicatorsService = inject(IndicatorsService);

    public paramX = input<string>();
    public paramY = input<string>();
    public paramZ = input<string>();
    public year = input<string>();
    public bubbleData$!: Observable<BubbleChartData[] | undefined>;
    public lineData$!: Observable<LineChartData[] | undefined>;
    public legend = signal<{ label: string, color: string }[]>([]);

    constructor() {
        super();

        this.bubbleData$ = combineLatest([
            toObservable(this.paramX),
            toObservable(this.paramY),
            toObservable(this.paramZ),
            toObservable(this.year)
        ]).pipe(
            filter(([ x, y, z, year ]) => !!x && !!y && !!z && !!year),
            switchMap(([ x, y, z, year ]) => this.indicatorsService.getIntersections(+this.sdg(), year!, x!, y!, z!)),
            map(data => data && this.mapBubbleData(data)),
        );

        this.lineData$ = combineLatest([
            toObservable(this.paramX),
            toObservable(this.paramY),
            toObservable(this.paramZ),
        ]).pipe(
            filter(([ x, y, z ]) => !!x && !!y && !!z),
            switchMap(([ x, y, z ]) => this.indicatorsService.getIntersectionsTimeline(+this.sdg(), x!, y!, z!)),
            map(data => data && this.mapLineData(data)),
        );
    }

    public override async ngOnInit() {
        super.ngOnInit();

        if (!this.paramX() && !this.paramY() && !this.paramZ()) {
            const [ x, y, z ] = this.indicatorOptions().map(({ value }) => value);
            setTimeout(async () => {
                await this.setQueryParam('paramX', x);
                await this.setQueryParam('paramY', y);
                await this.setQueryParam('paramZ', z);
            });
        }
    }

    private mapBubbleData(intersections: IndicatorsIntersections): BubbleChartData[] {
        return Object.values(intersections).map(value => ({
            xValue: value.indicator1_value,
            yValue: value.indicator2_value,
            radius: value.indicator3_value,
            country: value.country_name,
            color: getColorByCountryCode(value.country_code)!
        }));
    }

    private mapLineData(intersections: IndicatorIntersectionTimeline[]): LineChartData[] {
        return intersections.flatMap(({ countries, indicator }) =>
            countries.map(({ name, code, timeline }) => ({
                label: name,
                subLabel: indicator,
                color: getColorByCountryCode(code)!,
                points: timeline.map(({ year, value }: { year: number, value: number }) => ({ x: year, y: value }))
            }))
        );
    }
}
