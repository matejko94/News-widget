import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, provideHttpClient, withJsonpSupport } from "@angular/common/http";
import { provideAnimations } from "@angular/platform-browser/animations";
import { bootstrapApplication } from "@angular/platform-browser";
import { APP_CONFIG, configFactory } from "./config";
import { AsyncPipe, DatePipe, SlicePipe } from "@angular/common";
import { HeatmapComponent } from "./components/heatmap.component";
import { SentimentMeterComponent } from "./components/sentiment-meter.component";
import { CloudData, TagCloudComponent } from "angular-tag-cloud-module";
import { BehaviorSubject, catchError, delay, EMPTY, filter, map, Observable, of, pairwise, shareReplay, startWith, switchMap, tap } from "rxjs";
import { NewsItem } from "./entities/news-item.interface";
import { CloudDataDto } from "./entities/cloud-data-dto.interface";

@Component({
    selector: 'news-widget',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ AsyncPipe, DatePipe, HeatmapComponent, SentimentMeterComponent, SlicePipe, TagCloudComponent ],
    styles: [ `
      @tailwind base;
      @tailwind components;
      @tailwind utilities;

      ::ng-deep body {
        font-family: 'Roboto', sans-serif;
        font-size: 16px;
        line-height: 1.5;
        margin: 0;
        padding: 0;

        * {
          box-sizing: border-box;
        }
      }

      :host {
        display: block;
        width: 100%;
        height: 100%;
        padding: 0.25rem;
      }

      .h-container {
        height: 550px;
      }
    ` ],
    template: `
        <app-heatmap [newsItems]="data$ | async"/>

        <div class="grid grid-cols-2 h-container">
            <div class="overflow-y-auto h-container">
                @for (newsItem of data$ | async; track newsItem._source.url) {
                    <div class="border-b-2 my-3" [title]="(newsItem._source.body | slice:0:100) + '...'">
                        <a class="font-semibold text-lg mb-2" [href]="newsItem._source.url">
                            {{ newsItem._source.title | slice:0:40 }}
                        </a>
                        <div class="text-gray-500 text-lg">
                            {{ newsItem._source.dateTimePub | date: 'EEE MMM d yyyy, HH:mm': 'UTC' }}
                        </div>
                    </div>
                } @empty {
                    <div class="flex flex-col justify-center items-center h-full text-xl font-semibold text-gray-600">
                        No news found
                    </div>
                }
            </div>

            <div class="overflow-hidden flex flex-col items-center">
                <angular-tag-cloud [overflow]="false" [data]="(cloudData$ | async) ?? []" class="!w-full m-auto"/>
                <app-sentiment-meter [value]="sentiment$ | async" class="pl-6"/>
                <div class="flex justify-between gap-4 ml-6 w-full">
                    <div class="text-lg">
                        <div>Showing: <b>{{ loadedDate$ | async | date: 'dd.MM.yyyy' }}</b></div>
                        <div>
                            Total: <b>{{ (data$ | async)?.length }}</b> | Sentiment: <b>{{ sentiment$ | async }}</b>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
})
export class AppComponent implements OnInit {
    private http = inject(HttpClient);
    private appConfig = inject(APP_CONFIG);

    public shownDate$ = new BehaviorSubject(new Date());
    public loadedDate$ = new BehaviorSubject(new Date());
    public isLoading$ = new BehaviorSubject(true);
    public data$: Observable<NewsItem[]> = EMPTY;
    public cloudData$: Observable<CloudData[]> = EMPTY;
    public sentiment$: Observable<number> = EMPTY;

    public ngOnInit() {
        this.shownDate$.next(new Date());
        this.data$ = this.initializeData();
        this.cloudData$ = this.initializeCloudData();
        this.sentiment$ = this.initializeSentiment();

        this.isLoading$.pipe(
            startWith(true),
            pairwise(),
            filter(([ prev, next ]) => prev && !next),
            delay(this.appConfig.delayMs),
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
        return this.shownDate$.pipe(
            tap(() => this.isLoading$.next(true)),
            switchMap(shownDate => this.http.post<{ hits: { hits: NewsItem[] } }>(
                this.appConfig.elasticSearchUrl,
                {
                    "size": 10000,
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "match": {
                                        "SDG.keyword": `SDG ${ this.appConfig.sdg }`
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
        return this.http.get<CloudDataDto>(`https://news-widget.pages.dev/tags?topicKey=${ this.appConfig.topicKey }`)
            .pipe(
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
        return new Date(new Date().setDate(new Date().getDate() - this.appConfig.lastDays));
    }

}

bootstrapApplication(AppComponent, {
    providers: [
        provideHttpClient(withJsonpSupport()),
        provideAnimations(),
        {provide: APP_CONFIG, useFactory: configFactory}
    ]
}).catch(err => console.error(err));
