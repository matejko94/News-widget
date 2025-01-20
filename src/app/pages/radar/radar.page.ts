import { Component, inject, OnInit, signal } from '@angular/core';
import { map, Observable } from 'rxjs';
import { SDG_COLORS } from '../../../../configuration/colors/policy/sdg.colors';
import { ScienceService } from '../../domain/science/service/science.service';
import { TopTopicsPerYear } from '../../domain/science/types/topic-timespan.interface';
import { LineChartComponent, LollipopChartData } from '../../ui/charts/lollipop-chart/lollipop-chart.component';
import { RadarChartComponent } from '../../ui/charts/radar-chart/radar-chart.component';
import { TimelineRow } from '../../ui/charts/timeline/timeline-chart.component';
import { MultiMenuComponent } from '../../ui/multi-menu/multi-menu.component';
import { YearSliderComponent } from '../../ui/year-slider/year-slider.component';
import { BasePage } from '../base.page';

@Component({
    selector: 'radar-page',
    standalone: true,
    imports: [
        LineChartComponent,
        RadarChartComponent,
        MultiMenuComponent,
        YearSliderComponent,
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
        <div class="w-full mb-10">
            <app-year-slider [min]="2000" [max]="2021" autoIncrement/>
            <app-multi-menu queryParam="region" label="Select region" [options]="worldRegionOptions"
                            class="ml-auto mr-4"/>
        </div>

        <!--        @if (data$ | async; as data) {-->
        @if (data?.length) {
            <div class="flex max-md:flex-col justify-between max-md:justify-start w-full h-full max-md:h-fit
                overflow-y-hidden">
                <app-radar-chart [data]="radarData" class="md:max-w-[46%]"/>
                <app-lollipop-chart [data]="data" class="md:mt-8 md:max-w-[46%]"/>
            </div>
        } @else {
            <div class="flex items-center justify-center w-full h-full text-2xl text-gray-400">
                No data available
            </div>
        }
        <!--        }-->
    `
})
export default class RadarPage extends BasePage implements OnInit {
    private scienceService = inject(ScienceService);

    public data = this.generateMockData();
    public radarData = this.data.map(({ yValue, xValue }) => ({ axis: yValue, value: xValue }));
    public data$!: Observable<TimelineRow[]>;
    public sdgColors = SDG_COLORS.colors;
    public legend = signal<{ label: string, color: string }[]>([]);

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
        const topicSdg = new Map<string, number>();

        years.forEach(({ year, topics }) => {
            topics.forEach(({ key: topic, SDG }) => {
                if (!topicTopYears.has(topic)) {
                    topicTopYears.set(topic, []);
                }

                if (!topicSdg.has(topic)) {
                    topicSdg.set(topic, +(SDG.split(' ')[1]));
                }

                topicTopYears.get(topic)!.push(year);
            });
        });

        this.legend.set(this.sdgColors.map((color, index) => ({ label: `SDG ${ index + 1 }`, color })));

        return Array.from(topicTopYears.entries())
            .map(([ name, topYears ]) => ({
                name,
                sdg: topicSdg.get(name)!,
                years: topYears.sort(),
                color: this.sdgColors[topicSdg.get(name)! - 1]
            }));
    }

    private generateMockData(): LollipopChartData[] {
        const sdgLabels = Array.from({ length: 17 }, (_, i) => `SDG ${ i + 1 }`);
        const data = sdgLabels.map(label => ({
            xValue: Math.floor(Math.random() * 1001),
            yValue: label
        }));

        console.log({ data });
        return data;
    }
}
