import { AsyncPipe } from '@angular/common';
import { Component, inject, input, OnInit } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { combineLatest, filter, map, Observable, switchMap, tap } from 'rxjs';
import { getColorByCountryName } from '../../../../configuration/countries/countries';
import { NewsService } from '../../domain/news/service/news.service';
import { CalendarChartComponent, CalendarData } from '../../ui/charts/calendar-chart/calendar-chart.component';
import { WorldMapComponent, WorldMapData } from '../../ui/charts/world-heatmap-chart/world-heatmap-chart.component';
import { MenuComponent } from '../../ui/menu/menu.component';
import { YearSliderComponent } from '../../ui/year-slider/year-slider.component';
import { BasePage } from '../base.page';

@Component({
    selector: 'intensity-page',
    standalone: true,
    imports: [
        YearSliderComponent,
        MenuComponent,
        CalendarChartComponent,
        AsyncPipe,
        WorldMapComponent,

    ],
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
            background: white;
        }
    `,
    template: `
        <div class="w-full">
            <app-year-slider [min]="2000" [max]="2025" autoIncrement/>
        </div>
        <div class="flex justify-end items-center w-full mb-5 pr-4">
            <app-menu queryParam="topic" label="Indicator X" [options]="topicOptions()"/>
        </div>

        <div class="flex flex-col justify-start w-full h-fit">
            @if (heatmapData$ | async; as heatmapData) {
                <app-world-heatmap-chart class="h-[50vh]" [data]="heatmapData" countLabel="News"/>
            }

            @if (calendarData$ | async; as calendarData) {
                <app-calendar-chart [data]="calendarData"/>
            }
        </div>
    `
})
export default class IntensityPage extends BasePage implements OnInit {
    private newsService = inject(NewsService);

    public year = input<number>();
    public heatmapData$ = this.setupHeatMapData();
    public calendarData$ = this.setupCalendarData();

    public override async ngOnInit() {
        super.ngOnInit();

        if (!this.topic()) {
            const [ firstTopic ] = this.topicOptions().map(({ value }) => value);
            await this.setQueryParam('topic', firstTopic);
        }

    }

    private setupHeatMapData(): Observable<WorldMapData[]> {
        return combineLatest([
            toObservable(this.sdg),
            toObservable(this.topic),
            toObservable(this.year)
        ]).pipe(
            filter(([ sdg, topic, year ]) => !!sdg && !!topic && !!year),
            switchMap(([ sdg, topic, year ]) => this.newsService.getNewsIntensityPerYear(sdg, topic!, year!)),
            map(news => news.map(({ country, value }) => {
                return {
                    country,
                    count: value,
                    color: getColorByCountryName(country)!
                };
            })),
            tap(data => console.log({ data }))
        );
    }

    private setupCalendarData(): Observable<CalendarData[]> {
        return combineLatest([
            toObservable(this.sdg),
            toObservable(this.topic)
        ]).pipe(
            filter(([ sdg, topic ]) => !!sdg && !!topic),
            switchMap(([ sdg, topic ]) => this.newsService.getNewsIntensity(sdg, topic!)),
            map(news => news.map(({ date, value }) => ({ date: new Date(date), count: value })))
        );
    }
}
