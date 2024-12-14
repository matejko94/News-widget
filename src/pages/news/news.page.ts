import { ChangeDetectionStrategy, Component, inject, input, OnInit } from "@angular/core";
import { BehaviorSubject, delay, EMPTY, filter, map, Observable, pairwise, shareReplay, startWith, switchMap, tap } from "rxjs";
import { NewsItem } from "../../domain/news/entity/news-item.interface";
import { CloudData, TagCloudComponent } from "angular-tag-cloud-module";
import { SentimentMeterComponent } from "../../ui/sentiment-meter/sentiment-meter.component";
import { AsyncPipe, DatePipe, SlicePipe } from "@angular/common";
import { HeatmapComponent } from "../../ui/charts/heatmap/heatmap.component";
import { NewsService } from "../../domain/news/service/news.service";

@Component({
    selector: 'app-news',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        TagCloudComponent,
        SentimentMeterComponent,
        AsyncPipe,
        DatePipe,
        SlicePipe,
        HeatmapComponent
    ],
    styles: `
      .h-container {
        height: 550px;
      }
    `,
    template: `
        <app-heatmap [newsItems]="news$ | async" [zoom]="2" [mapHeight]="'auto'"
                     [location]="{ lat: 40, lng: 0}" [mapCircleRadiusFactor]="1.5"/>

        <div class="grid grid-cols-2 h-container">
            <div class="overflow-y-auto h-container">
                @for (newsItem of news$ | async; track newsItem._source.url) {
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
                <angular-tag-cloud [realignOnResize]="true" [overflow]="false" [data]="(cloudData$ | async) ?? []"
                                   class="pl-6"/>
                
                <app-sentiment-meter [value]="sentimentAverage$ | async" class="pl-6"/>
                
                <div class="flex justify-between gap-4 ml-6 w-full">
                    <div class="text-lg">
                        <div>Showing: <b>{{ loadedDate$ | async | date: 'dd.MM.yyyy' }}</b></div>
                        <div>
                            Total: <b>{{ (news$ | async)?.length }}</b> | Sentiment:
                            <b>{{ sentimentAverage$ | async }}</b>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export default class NewsPage implements OnInit {
    private newsService = inject(NewsService);

    public sdg = input.required<string>();
    public topicKey = input.required<string>();
    public shownDate$ = new BehaviorSubject(new Date());
    public loadedDate$ = new BehaviorSubject(new Date());
    public isLoading$ = new BehaviorSubject(true);
    public news$: Observable<NewsItem[]> = EMPTY;
    public cloudData$: Observable<CloudData[]> = EMPTY;
    public sentimentAverage$: Observable<number> = EMPTY;

    public ngOnInit() {
        this.shownDate$.next(new Date());
        this.news$ = this.setupNews();
        this.cloudData$ = this.newsService.getCloudData(this.topicKey());
        this.sentimentAverage$ = this.setupSentimentAverage();
        this.startCounter();
    }

    private setupNews() {
        return this.shownDate$.pipe(
            tap(() => this.isLoading$.next(true)),
            switchMap(shownDate => this.newsService.getNews(shownDate, this.sdg())),
            tap(() => {
                this.loadedDate$.next(this.shownDate$.value);
                this.isLoading$.next(false);
            }),
            shareReplay(1),
        );
    }

    private setupSentimentAverage() {
        return this.news$.pipe(
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

    private startCounter() {
        return this.isLoading$.pipe(
            startWith(true),
            pairwise(),
            filter(([ prev, next ]) => prev && !next),
            delay(1500),
            tap(() => {
                const currentDate = new Date(this.shownDate$.value);

                if (currentDate >= this.minDate) {
                    this.shownDate$.next(new Date(currentDate.setDate(currentDate.getDate() - 1)));
                } else {
                    this.shownDate$.next(new Date());
                }
            }),
        ).subscribe();
    }

    private get minDate() {
        const maxDaysBack = 31;
        return new Date(new Date().setDate(new Date().getDate() - maxDaysBack));
    }
}
