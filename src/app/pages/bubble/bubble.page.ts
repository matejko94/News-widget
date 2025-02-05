import { Component, inject, input, OnInit, signal } from '@angular/core';
import { map, Observable } from 'rxjs';
import { SDG_COLORS } from '../../../../configuration/colors/policy/sdg.colors';
import { COUNTRIES, Country } from '../../../../configuration/countries/countries';
import { ScienceService } from '../../domain/science/service/science.service';
import { TopTopicsPerYear } from '../../domain/science/types/topic-timespan.interface';
import { BubbleChartComponent } from '../../ui/charts/bubble-chart/bubble-chart.component';
import { LineChartComponent, LineChartData } from '../../ui/charts/line-chart/line-chart.component';
import { TimelineRow } from '../../ui/charts/timeline/timeline-chart.component';
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

        <div class="flex justify-between items-center w-full max-w-3xl mx-auto mb-5 ">
            <app-menu queryParam="paramX" label="Indicator X" [options]="topicOptions()"/>
            <app-menu queryParam="paramY" label="Indicator Y" [options]="topicOptions()"/>
            <app-menu queryParam="paramZ" label="Indicator Z" [options]="topicOptions()"/>
        </div>

        <!--        @if (data$ | async; as data) {-->
        @if (data?.length) {
            <div class="flex flex-col gap-10 justify-start w-full">
                <app-bubble-chart class="aspect-[2/1]" [data]="data"
                                  [xAxisLabel]="paramX()!"
                                  [yAxisLabel]="paramY()!"
                                  [zAxisLabel]="paramZ()!"
                />
                <app-line-chart class="aspect-[2/1]" [data]="lineData"
                                xAxisLabel="Year"
                                yAxisLabel="Country"
                                groupLabel="Indicator"
                />
            </div>
        } @else {
            <div class="flex items-center justify-center w-full h-full text-2xl text-gray-400">
                No data available
            </div>
        }
        <!--        }-->
    `
})
export default class BubblePage extends BasePage implements OnInit {
    private scienceService = inject(ScienceService);

    public paramX = input<string>();
    public paramY = input<string>();
    public paramZ = input<string>();
    public data = this.generateMockBubbleData(COUNTRIES, 30);
    public lineData = this.generateMockTimelineData(COUNTRIES, 15);
    public data$!: Observable<TimelineRow[]>;
    public sdgColors = SDG_COLORS.colors;
    public legend = signal<{ label: string, color: string }[]>([]);

    public override async ngOnInit() {
        super.ngOnInit();

        if (!this.paramX() || !this.paramY() || !this.paramZ()) {
            const [ x, y, z ] = this.topicOptions().map(({ value }) => value);
            await this.setQueryParam('paramX', x);
            await this.setQueryParam('paramY', y);
            await this.setQueryParam('paramZ', z);
        }

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

    private generateMockBubbleData(allCountries: Country[], amount: number) {
        const maxAmount = Math.min(amount, allCountries.length);
        const copy = [ ...allCountries ];

        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [ copy[i], copy[j] ] = [ copy[j], copy[i] ];
        }

        return copy.slice(0, maxAmount).map((country) => ({
            color: country.color,
            country: country.name,
            xValue: Math.floor(Math.random() * 991) + 10, // range 10..1000
            yValue: Math.floor(Math.random() * 991) + 10, // range 10..1000
            radius: Math.floor(Math.random() * 91) + 10, // range 10..100
        }));
    }

    private generateMockTimelineData(allCountries: Country[], amount: number): LineChartData[] {
        const years = Array.from({ length: 26 }, (_, i) => i + 2000);
        const maxAmount = Math.min(amount, allCountries.length);
        const copy = [ ...allCountries ];

        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [ copy[i], copy[j] ] = [ copy[j], copy[i] ];
        }

        return copy.slice(0, maxAmount).map((country) => ({
            label: country.name,
            subLabel: 'Sublabel',
            color: country.color,
            points: years.map(year => ({
                x: year,
                y: Math.floor(Math.random() * 91) + 10 // range 10..100
            }))
        }));
    }
}
