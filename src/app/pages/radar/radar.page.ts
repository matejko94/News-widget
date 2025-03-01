import { AsyncPipe } from '@angular/common';
import { Component, inject, input, OnInit, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { combineLatest, filter, map, Observable, shareReplay, switchMap, tap } from 'rxjs';
import { SDG_COLORS } from '../../../../configuration/colors/policy/sdg.colors';
import { PolicyService } from '../../domain/policy/service/policy.service';
import { RadarDto } from '../../domain/policy/types/radar.dto';
import { LineChartComponent, LollipopChartData } from '../../ui/charts/lollipop-chart/lollipop-chart.component';
import { RadarChartComponent, RadarChartData } from '../../ui/charts/radar-chart/radar-chart.component';
import { MultiMenuComponent } from '../../ui/components/multi-menu/multi-menu.component';
import { YearSliderComponent } from '../../ui/components/year-slider/year-slider.component';
import { BasePage } from '../base.page';

@Component({
    selector: 'radar-page',
    standalone: true,
    imports: [
        RadarChartComponent,
        LineChartComponent,
        YearSliderComponent,
        MultiMenuComponent,
        AsyncPipe
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
            <app-year-slider [min]="2000" [max]="2021" autoIncrement/>
            <app-multi-menu queryParam="regions" label="Select region" [options]="worldRegionOptions"
                            class="ml-auto mr-4"/>
        </div>

        @let radarData = radarData$ | async;
        @let lollipopData = lollipopData$ | async;
        @if (radarData?.length === 0 || lollipopData?.length === 0) {
            <div class="flex max-md:flex-col justify-between max-md:justify-start w-full h-full max-md:h-fit
                md:overflow-y-hidden">
                @if (radarData) {
                    <app-radar-chart [data]="radarData" class="md:max-w-[46%]"/>
                }

                @if (lollipopData) {
                    <app-lollipop-chart [data]="lollipopData" class="md:mt-8 md:max-w-[46%]"/>
                }
            </div>
        } @else {
            <div class="flex items-center justify-center w-full h-full text-2xl text-gray-400">
                No data available
            </div>
        }
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
            toObservable(this.regions),
            toObservable(this.year)
        ]).pipe(
            filter(([ sdg, _, year ]) => !!sdg && !!year),
            switchMap(([ sdg, regions, year ]) => this.policyService.getRadarData(+sdg, regions, +year!)),
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
