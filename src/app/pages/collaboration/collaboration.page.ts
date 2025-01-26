import { Component, input, OnInit } from '@angular/core';
import { ChordChartComponent } from '../../ui/charts/chord-chart/chord-chart.component';
import { MenuComponent } from '../../ui/menu/menu.component';
import { BasePage } from '../base.page';

@Component({
    selector: 'collaboration-page',
    standalone: true,
    imports: [
        MenuComponent,
        ChordChartComponent,

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
        <div class="flex justify-end items-center w-full mt-3 mb-5 pr-4">
            <app-menu queryParam="topic" label="Indicator X" [options]="topicOptions()"/>
        </div>

        <app-chord-chart [data]="data" class="w-full flex-1 min-h-0"/>
    `
})
export default class CollaborationPage extends BasePage implements OnInit {

    public data = {
        matrix: [
            [ 11975, 5871, 8916, 2868 ],
            [ 1951, 10048, 2060, 6171 ],
            [ 8010, 16145, 8090, 8045 ],
            [ 1013, 990, 940, 6907 ]
        ],
        names: [ 'Alpha', 'Beta', 'Gamma', 'Delta' ],
        colors: [ '#FF5733', '#33C3FF', '#FF33A8', '#33FF57' ]
    };
    public year = input<number>();


    public override async ngOnInit() {
        super.ngOnInit();

        if (!this.topic()) {
            const [ firstTopic ] = this.topicOptions().map(({ value }) => value);
            await this.setQueryParam('topic', firstTopic);
        }
    }

    // private setupHeatMapData(): Observable<WorldMapData[]> {
    //     return combineLatest([
    //         toObservable(this.sdg),
    //         toObservable(this.topic),
    //         toObservable(this.year)
    //     ]).pipe(
    //         filter(([ sdg, topic, year ]) => !!sdg && !!topic && !!year),
    //         switchMap(([ sdg, topic, year ]) => this.newsService.getNewsIntensityPerYear(sdg, topic!, year!)),
    //         map(news => news.map(({ country, value }) => {
    //             return {
    //                 country,
    //                 count: value,
    //                 color: getColorByCountryName(country)!
    //             };
    //         })),
    //         tap(data => console.log({ data }))
    //     );
    // }
}
