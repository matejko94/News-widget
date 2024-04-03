import { ChangeDetectionStrategy, Component, inject, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpClient, HttpHeaders, provideHttpClient, withJsonpSupport } from "@angular/common/http";
import { GoogleMapsModule } from "@angular/google-maps";
import { BehaviorSubject, catchError, delay, EMPTY, filter, map, Observable, of, pairwise, shareReplay, startWith, switchMap, tap } from "rxjs";
import { AsyncPipe, DatePipe, JsonPipe, SlicePipe } from "@angular/common";
import { NewsItem } from "./entities/news-item.interface";
import { CloudData, TagCloudComponent } from "angular-tag-cloud-module";
import { provideAnimations } from "@angular/platform-browser/animations";
import { createCustomElement } from "@angular/elements";
import { createApplication } from "@angular/platform-browser";
import { SentimentMeterComponent } from "./components/sentiment-meter.component";
import { CloudDataDto } from "./entities/cloud-data-dto.interface";
import { HeatmapComponent } from "./components/heatmap.component";
import { toNumber } from "./util/to-number";

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [ GoogleMapsModule, AsyncPipe, SentimentMeterComponent, DatePipe, JsonPipe, SlicePipe, TagCloudComponent, HeatmapComponent ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.ShadowDom,
    styles: [ `
      @tailwind base;
      @tailwind components;
      @tailwind utilities;

      :host {
        display: block;
        width: 100%;
        height: 100%;
        padding: 0.25rem;
      }

      google-map .map-container {
        aspect-ratio: 16 / 9;
      }
    ` ],
    template: `
        <app-heatmap [googleMapsApiKey]="googleMapsApiKey" [mapHeight]="mapHeight" [zoom]="zoom"
                     [mapCircleRadiusFactor]="mapCircleRadiusFactor" [location]="{lat,lng}" [newsItems]="data$ | async"
        />
        <div class="grid grid-cols-2 h-[550px]">
            <div class="overflow-y-auto h-full">
                @for (newsItem of data$ | async; track newsItem._source.url) {
                    <div class="border-b-2 my-3" [title]="(newsItem._source.body | slice:0:100) + '...'">
                        <a class="font-semibold text-lg mb-2" [href]="newsItem._source.url">
                            {{ newsItem._source.title | slice:0:40 }}
                        </a>
                        <div class="text-gray-500 text-lg">
                            {{ newsItem._source.dateTimePub | date: 'EEE MMM d yyyy, HH:mm': 'UTC' }}
                        </div>
                    </div>
                }
            </div>

            <div class="overflow-hidden">
                <angular-tag-cloud [overflow]="false" [data]="(cloudData$ | async) ?? []" class="!w-full m-auto"/>
                <app-sentiment-meter [value]="sentiment$ | async"/>
                <div class="flex justify-between gap-4 mt-4 ml-6 w-full">
                    <div class="text-lg">
                        <div>Showing: <b>{{ loadedDate$ | async | date: 'dd.MM.yyyy' }}</b></div>
                        <div>Total: <b>{{ (data$ | async)?.length }}</b> | Sentiment: <b>{{ sentiment$ | async }}</b>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
})
export class AppComponent implements OnInit {
    private http = inject(HttpClient);

    @Input({alias: 'google-maps-api-key'}) public googleMapsApiKey?: string;
    @Input({alias: 'elastic-search-url'}) public elasticSearchUrl?: string;
    @Input({alias: 'map-height'}) public mapHeight?: string;
    @Input({alias: 'map-circle-radius-factor', transform: toNumber}) public mapCircleRadiusFactor: number = 1;
    @Input({alias: 'last-days', transform: toNumber}) public lastDays!: number;
    @Input({alias: 'delay-ms', transform: toNumber}) public delayMs?: number;
    @Input({alias: 'tag-endpoint'}) public tagEndpoint!: string;
    @Input({alias: 'tag-key'}) public apiKey!: string;
    @Input({transform: toNumber}) public zoom: number = 0;
    @Input({transform: toNumber}) public lat: number = 0;
    @Input({transform: toNumber}) public lng: number = 0;
    @Input() public sdg!: string;
    @Input() public uri!: string;
    public shownDate$ = new BehaviorSubject(new Date());
    public loadedDate$ = new BehaviorSubject(new Date());
    public isLoading$ = new BehaviorSubject(true);
    public data$: Observable<NewsItem[]> = EMPTY;
    public cloudData$: Observable<CloudData[]> = EMPTY;
    public sentiment$: Observable<number> = EMPTY;

    public ngOnInit() {
        if (!this.googleMapsApiKey) console.error('missing google maps api key');
        if (!this.elasticSearchUrl) console.error('missing elastic search url');
        if (!this.lastDays) console.error('missing last days');
        if (!this.delayMs) console.error('missing delay ms');
        if (!this.sdg) console.error('missing sdg');
        if (!this.uri) console.error('missing uri');
        if (!this.apiKey) console.error('missing api key');

        this.shownDate$.next(new Date());
        this.data$ = this.initializeData();
        this.cloudData$ = this.initializeCloudData();
        this.sentiment$ = this.initializeSentiment();

        this.isLoading$.pipe(
            startWith(true),
            pairwise(),
            filter(([ prev, next ]) => prev && !next),
            delay(this.delayMs ?? 0),
            tap(() => {
                const currentDate = new Date(this.shownDate$.value);

                if (currentDate >= this.minDate) {
                    this.shownDate$.next(new Date(currentDate.setDate(currentDate.getDate() - 1)));
                } else {
                    this.shownDate$.next(new Date());
                }
            }),
        ).subscribe()
    }

    private initializeData() {
        if (!this.elasticSearchUrl) {
            return of([]);
        }

        return this.shownDate$.pipe(
            tap(() => this.isLoading$.next(true)),
            switchMap(shownDate => this.http.post<{ hits: { hits: NewsItem[] } }>(this.elasticSearchUrl!,
                {
                    "size": 10000,
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "match": {
                                        "SDG.keyword": `SDG ${ this.sdg }`
                                    }
                                },
                                {
                                    "range": {
                                        "dateTimePub": {
                                            "gte": shownDate.toISOString(),
                                            "lt": new Date(new Date(shownDate).setDate(shownDate.getDate() + 1)).toISOString(),
                                        }
                                    }
                                }
                            ]
                        }
                    }
                },
                {
                    headers: new HttpHeaders({
                        'Content-Type': 'application/json',
                        'Authorization': 'Basic ' + btoa('elastic_searchpoint:9GWd1yPhSRxvP7JTrZ'),
                    }),
                })),
            map(response => response.hits.hits),
            catchError(e => {
                console.error('failed to fetch data', e);
                return of([])
            }),
            tap(() => {
                this.loadedDate$.next(this.shownDate$.value);
                this.isLoading$.next(false);
            }),
            shareReplay(1),
        )
    }

    private initializeSentiment() {
        return this.data$.pipe(
            map(data => {
                let total = 0;
                let sentiment = 0;

                data.forEach(item => {
                    if (item._source.sentiment !== null && item._source.sentiment !== undefined) {
                        total++;
                        sentiment += item._source.sentiment;
                    }
                })

                return Math.round((sentiment / (total || 1)) * 100) / 100;
            }),
            shareReplay(1),
        )
    }

    private initializeCloudData() {
        return this.http.get<CloudDataDto>(
            `${ this.tagEndpoint }?uri=${ this.uri }&apiKey=${ this.apiKey }&resultType=keywordAggr`
        ).pipe(
            map(({keywordAggr}) => keywordAggr.results.map(result => ({
                text: result.keyword,
                weight: result.weight * 1000
            }))),
            shareReplay(1),
            catchError(e => {
                console.error('failed to fetch cloud data', e);
                return of([])
            })
        );

    }

    private get minDate() {
        return new Date(new Date().setDate(new Date().getDate() - this.lastDays));
    }

}

(async () => {
    const {injector} = await createApplication({
        providers: [
            provideHttpClient(withJsonpSupport()),
            provideAnimations()
        ]
    })

    customElements.define('news-widget', createCustomElement(AppComponent, {injector}));
})();
