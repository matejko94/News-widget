import { AsyncPipe } from '@angular/common';
import { Component, inject, input, OnInit, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { combineLatest, filter, map, Observable, shareReplay, switchMap } from 'rxjs';
import { PolicyService } from '../../domain/policy/service/policy.service';
import { RadarDto } from '../../domain/policy/types/radar.dto';
import { LollipopChartComponent, LollipopChartData } from '../../ui/charts/lollipop-chart/lollipop-chart.component';
import { RadarChartComponent, RadarChartData } from '../../ui/charts/radar-chart/radar-chart.component';
import { MenuComponent } from '../../ui/components/menu/menu.component';
import { YearSliderComponent } from '../../ui/components/year-slider/year-slider.component';
import { BasePage } from '../base.page';

@Component({
    selector: 'radar-page',
    standalone: true,
    imports: [
        RadarChartComponent,
        LollipopChartComponent,
        YearSliderComponent,
        AsyncPipe,
        MenuComponent
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
        <div class="w-full flex flex-col items-end">
            <app-year-slider [min]="2015" [max]="2025" autoIncrement/>
            <app-menu queryParam="region" label="Select region" [options]="worldRegionOptions" class="w-fit mr-4" showClear/>
        </div>

        <div class="flex max-md:flex-col justify-between max-md:justify-start w-full h-full max-md:h-fit
                md:overflow-y-hidden">
            @if (radarData$ | async; as radarData) {
                @if (radarData.length) {
                    <app-radar-chart [data]="radarData" class="md:max-w-[46%]"/>
                } @else {
                    <div class="flex items-center justify-center w-full my-20 text-2xl text-gray-400">
                        No data available
                    </div>
                }
            }

            @if (lollipopData$ | async; as lollipopData) {
                @if (lollipopData.length) {
                    <app-lollipop-chart [data]="lollipopData" class="md:mt-8 md:max-w-[46%]"/>
                } @else {
                    <div class="flex items-center justify-center w-full my-20 text-2xl text-gray-400">
                        No data available
                    </div>
                }
            }
        </div>

    `
})
export default class RadarPage extends BasePage implements OnInit {
    private policyService = inject(PolicyService);

    public year = input();
    public lollipopData$!: Observable<LollipopChartData[]>;
    public radarData$!: Observable<RadarChartData[]>;
    public legend = signal<{ label: string, color: string }[]>([]);

    constructor() {
        super();

        const data$ = combineLatest([
            toObservable(this.sdg),
            toObservable(this.region),
            toObservable(this.year)
        ]).pipe(
            filter(([ sdg, _, year ]) => !!sdg && !!year),
            switchMap(([ sdg, region, year ]) => this.policyService.getRadarData(+sdg!, region, +year!)),
            shareReplay(1)
        );

        this.lollipopData$ = data$.pipe(map(data => this.mapToLollipopData(data)));
        this.radarData$ = data$.pipe(map(data => this.mapToRadarData(data)));
    }

    private mapToLollipopData(data: RadarDto[]): LollipopChartData[] {
        return data.map(({ sdg, value }) => ({ xValue: value, yValue: sdg }));
    }

    private mapToRadarData(data: RadarDto[]): RadarChartData[] {
        return data.map(({ sdg, value }) => ({ axis: sdg, value }));
    }
}
