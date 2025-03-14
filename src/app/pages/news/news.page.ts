import { AsyncPipe, DatePipe, SlicePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { CloudData, TagCloudComponent } from 'angular-tag-cloud-module';
import { Checkbox } from 'primeng/checkbox';
import { BehaviorSubject, combineLatestWith, delay, distinctUntilChanged, EMPTY, filter, fromEvent, map, Observable, pairwise, shareReplay, skip, startWith, switchMap, tap } from 'rxjs';
import { NewsService } from '../../domain/news/service/news.service';
import { NewsItem } from '../../domain/news/types/news-item.interface';
import { HeatmapComponent } from '../../ui/charts/heatmap/heatmap.component';
import { SentimentMeterComponent } from '../../ui/charts/sentiment-meter/sentiment-meter.component';
import { MenuComponent } from '../../ui/components/menu/menu.component';
import { BasePage } from '../base.page';

@Component({
    selector: 'app-news',
    standalone: true,
    imports: [
        TagCloudComponent,
        SentimentMeterComponent,
        AsyncPipe,
        DatePipe,
        SlicePipe,
        HeatmapComponent,
        Checkbox,
        FormsModule,
        MenuComponent
    ],
    styles: `
        .h-container {
            height: 425px;

            &.no-keywords {
                height: 375px;
                overflow: hidden;
            }
        }

        ::ng-deep angular-tag-cloud.cloud {
            overflow: visible;
            --size: 10;

            @media (max-width: 1000px) {
                --size: 8;
            }

            @media (max-width: 800px) {
                --size: 6;
            }

            @media (max-width: 600px) {
                --size: 5;
            }

            span.w10 {
                font-size: calc(var(--size) * 40%);
            }

            span.w9 {
                font-size: calc(var(--size) * 35%);
            }

            span.w8 {
                font-size: calc(var(--size) * 32%);
            }

            span.w7 {
                font-size: calc(var(--size) * 29%);
            }

            span.w6 {
                font-size: calc(var(--size) * 26%);
            }

            span.w5 {
                font-size: calc(var(--size) * 23%);
            }

            span.w4 {
                font-size: calc(var(--size) * 20%);
            }

            span.w3 {
                font-size: calc(var(--size) * 17%);
            }

            span.w2 {
                font-size: calc(var(--size) * 14%);
            }

            span.w1 {
                font-size: calc(var(--size) * 11%);
            }
        }
    `,
    template: `
        <app-heatmap [newsItems]="news$ | async" [zoom]="2" [mapHeight]="'auto'"
                     [location]="{ lat: 40, lng: 0}" [mapCircleRadiusFactor]="1.5"/>

        @let news = news$ | async;
        @let data = cloudData$ | async;
        <div class="flex items-center gap-2 p-2">
            <div>Date: <b>{{ loadedDate$ | async | date: 'dd.MM.yyyy' }}</b></div>
            <div>Total news: <b>{{ news?.length }}</b></div>
            <div class="flex items-center ml-auto mr-2">
                <p-checkbox [(ngModel)]="onlyEnglish" [binary]="true" size="small" class="flex"/>
                <label class="ml-1">EN News Only</label>
            </div>

            @if (topicOptions().length) {
                <app-menu class="z-20" queryParam="topic" label="Topic" [options]="topicOptions()" showClear/>
            }
        </div>
        <div class="grid grid-cols-2 h-container" [class.no-keywords]="data?.length === 0">
            <div class="overflow-y-auto h-container" [class.no-keywords]="data?.length === 0">
                @for (newsItem of news; track newsItem.url) {
                    <div class="border-b-2 my-3 px-2" [title]="(newsItem.body | slice:0:100) + '...'">
                        <a class="font-semibold text-lg mb-2" [href]="newsItem.url">
                            {{ newsItem.title | slice:0:40 }}
                        </a>
                        <div class="text-gray-500 text-lg">
                            {{ newsItem.dateTime | date: 'EEE MMM d yyyy, HH:mm': 'UTC' }}
                        </div>
                    </div>
                } @empty {
                    <div class="h-full w-fit text-xl font-semibold text-gray-600 my-10 mx-auto">
                        No news today
                    </div>
                }
            </div>

            <div class="overflow-visible flex flex-col items-center">
                @if (data?.length) {
                    <angular-tag-cloud [height]="325" [realignOnResize]="true" [data]="data!" class="-mt-6 ml-4 cloud"
                                       [width]="width()"/>
                } @else {
                    <div class="h-full w-fit text-xl font-semibold text-gray-600 my-10 mx-auto">
                        No keywords today
                    </div>
                }

                @let sentiment = sentimentAverage$ | async;

                <app-sentiment-meter [value]="sentiment" class="pl-6"/>

                <div class="flex justify-center gap-2 w-full text-lg">
                    Sentiment: <b>{{ sentiment ?? 0 }}</b>
                </div>
            </div>
        </div>
    `
})
export default class NewsPage extends BasePage implements OnInit {
    private newsService = inject(NewsService);

    public shownDate$ = new BehaviorSubject(new Date());
    public loadedDate$ = new BehaviorSubject(new Date());
    public isLoading$ = new BehaviorSubject(false);
    public onlyEnglish = signal(false);
    public news$: Observable<NewsItem[]> = EMPTY;
    public cloudData$: Observable<CloudData[]> = EMPTY;
    public sentimentAverage$: Observable<number> = EMPTY;
    public width = toSignal(fromEvent(window, 'resize').pipe(
        map(() => window.innerWidth / 2.5),
        distinctUntilChanged()
    ));

    public override ngOnInit() {
        super.ngOnInit();

        this.shownDate$.next(new Date(new Date().setDate(new Date().getDate())));
        this.news$ = this.setupNews();
        this.cloudData$ = this.setupTags();
        this.sentimentAverage$ = this.setupSentimentAverage();
        this.startCounter();
    }

    private setupNews() {
        const topic$ = toObservable(this.topic, { injector: this.injector });
        const onlyEnglish$ = toObservable(this.onlyEnglish, { injector: this.injector });

        return this.shownDate$.pipe(
            filter(() => !this.isLoading$.value),
            tap(() => this.isLoading$.next(true)),
            switchMap(shownDate => this.newsService.getNews(shownDate, this.getErId(this.sdg()!))),
            tap(() => {
                this.isLoading$.next(false);
                this.loadedDate$.next(this.shownDate$.value);
            }),
            combineLatestWith(topic$, onlyEnglish$),
            map(([ news, topic, onlyEnglish ]) => this.filterNews(news, topic, onlyEnglish)),
            tap(news => console.log({ news })),
            shareReplay(1),
        );
    }

    private filterNews(news: NewsItem[], topic: string | undefined, onlyEnglish: boolean) {
        return news
            .filter(newsItem => {
                if (topic) {
                    const slugifiedTopic = topic.replace(' ', '_').toLowerCase();
                    return newsItem.concepts.some(concept => concept.uri.toLowerCase().includes(slugifiedTopic));
                }

                return true;
            })
            .filter(newsItem => {
                if (onlyEnglish) {
                    return newsItem.lang === 'eng';
                }

                return true;
            });
    }

    private setupTags() {
        return this.shownDate$.pipe(
            switchMap(shownDate => {
                const dayAfter = new Date(shownDate);
                dayAfter.setDate(dayAfter.getDate() + 1);

                return this.newsService.getCloudData(this.sdg(), shownDate, dayAfter, 18)
            }),
            shareReplay(1),
        )
    }

    private setupSentimentAverage() {
        return this.news$.pipe(
            map(data => {
                let total = 0;
                let sentiment = 0;

                data.forEach(item => {
                    if (item.sentiment !== null && item.sentiment !== undefined) {
                        total++;
                        sentiment += item.sentiment;
                    }
                })

                return Math.round((sentiment / (total || 1)) * 100) / 100;
            }),
            shareReplay(1),
        )
    }

    private startCounter() {
        return this.isLoading$.pipe(
            skip(1),
            startWith(true),
            pairwise(),
            filter(([ prev, next ]) => prev && !next),
            delay(2000),
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
