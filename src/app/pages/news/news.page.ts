import { AsyncPipe, DatePipe, SlicePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { CloudData, TagCloudComponent } from 'angular-tag-cloud-module';
import { Checkbox } from 'primeng/checkbox';
import { BehaviorSubject, combineLatestWith, distinctUntilChanged, EMPTY, filter, fromEvent, map, Observable, shareReplay, switchMap, tap, timer } from 'rxjs';
import { UNESCO_REGIONS } from '../../../../configuration/regions/unesco-regions';
import { ElasticNewsItem } from '../../../../functions/api/news/articles/interface/elastic-news-item';
import { NewsService } from '../../domain/news/service/news.service';
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
            /* Overall volume factor (0..1): shrinks the whole cloud on low-news days so a
               single-news day, where the library buckets every tag into w10, doesn't render
               every keyword at full size. Bound from the data in the template via --vol. */
            --unit: calc(var(--size) * var(--vol, 1) * 1%);

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
                font-size: calc(var(--unit) * 40);
            }

            span.w9 {
                font-size: calc(var(--unit) * 35);
            }

            span.w8 {
                font-size: calc(var(--unit) * 32);
            }

            span.w7 {
                font-size: calc(var(--unit) * 29);
            }

            span.w6 {
                font-size: calc(var(--unit) * 26);
            }

            span.w5 {
                font-size: calc(var(--unit) * 23);
            }

            span.w4 {
                font-size: calc(var(--unit) * 20);
            }

            span.w3 {
                font-size: calc(var(--unit) * 17);
            }

            span.w2 {
                font-size: calc(var(--unit) * 14);
            }

            span.w1 {
                font-size: calc(var(--unit) * 11);
            }
        }
    `,
    template: `
        <app-heatmap [newsItems]="news$ | async" [zoom]="2" [mapHeight]="'auto'"
                     [location]="{ lat: 40, lng: 0}" [mapCircleRadiusFactor]="1.5"/>

        @let news = news$ | async;
        @let data = cloudData$ | async;
        <div class="flex items-center gap-2 p-2">
            <button type="button" (click)="togglePlay()"
                    class="flex items-center justify-center w-7 h-7 rounded hover:bg-gray-200 transition-colors"
                    [attr.aria-label]="(paused$ | async) ? 'Start' : 'Stop'"
                    [title]="(paused$ | async) ? 'Start' : 'Stop'">
                @if (paused$ | async) {
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                } @else {
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>
                }
            </button>
            <div>Date: <b>{{ loadedDate$ | async | date: 'dd.MM.yyyy' }}</b></div>
            <div>Total news: <b>{{ news?.length }}</b></div>
            <div class="flex items-center ml-auto mr-2">
                <p-checkbox [(ngModel)]="onlyEnglish" [binary]="true" size="small" class="flex"/>
                <label class="ml-1">EN News Only</label>
            </div>
            <div class="flex items-center mr-2">
                <p-checkbox [(ngModel)]="onlyFrench" [binary]="true" size="small" class="flex"/>
                <label class="ml-1">FR News Only</label>
            </div>

            @if (isOer()) {
                <app-menu class="z-20" queryParam="region" label="Region" [options]="regionOptions" showClear/>
            } @else if (topicOptions().length) {
                <app-menu class="z-20" queryParam="topic" label="Topic" [options]="topicOptions()" showClear/>
            }
        </div>
        <div class="grid grid-cols-2 h-container" [class.no-keywords]="data?.length === 0">
            <div class="overflow-y-auto h-container" [class.no-keywords]="data?.length === 0">
                @for (newsItem of news; track newsItem.url) {
                    <div class="border-b-2 my-3 px-2" [title]="(newsItem.body | slice:0:100) + '...'">
                        <a class="font-semibold text-lg mb-2" [href]="newsItem.url" target="_blank" rel="noopener noreferrer">
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
                                       [overflow]="false" [style.--vol]="cloudVolume(data!)" [width]="width()"/>
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

    public readonly regionOptions = UNESCO_REGIONS;
    public readonly isOer = computed(() => (this.pilot() ?? '').toUpperCase().startsWith('OER'));

    public shownDate$ = new BehaviorSubject(new Date());
    public loadedDate$ = new BehaviorSubject(new Date());
    public isLoading$ = new BehaviorSubject(false);
    // Auto-play is on by default; the user can stop/start the date walk with the toggle.
    public paused$ = new BehaviorSubject(false);
    public onlyEnglish = signal(false);
    public onlyFrench = signal(false);
    public news$: Observable<ElasticNewsItem[]> = EMPTY;
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
        this.jumpToLatestNewsDate();
    }

    // Pilots can have no news for many recent days. Probe for the most recent day that
    // actually has news and jump straight to it, so the widget lands on data instead of
    // walking day-by-day through empty dates.
    // OER is intentionally excluded: there we want the widget to visibly animate through the
    // days (empty ones included) so viewers see it is live (see startCounter).
    private jumpToLatestNewsDate() {
        if (this.isOer()) {
            return;
        }

        this.newsService.getLatestNewsDate(+this.sdg()!, this.pilot()!).subscribe(latestDate => {
            this.latestDate = latestDate ?? new Date();
            this.shownDate$.next(this.latestDate);
        });
    }

    private setupNews() {
        const topic$ = toObservable(this.topic, { injector: this.injector });
        const region$ = toObservable(this.region, { injector: this.injector });
        const onlyEnglish$ = toObservable(this.onlyEnglish, { injector: this.injector });
        const onlyFrench$ = toObservable(this.onlyFrench, { injector: this.injector });

        return this.shownDate$.pipe(
            filter(() => !this.isLoading$.value),
            tap(() => this.isLoading$.next(true)),
            switchMap(shownDate => this.newsService.getNews(+this.sdg()!, this.pilot()!, shownDate)),
            tap(() => {
                this.isLoading$.next(false);
                this.loadedDate$.next(this.shownDate$.value);
            }),
            combineLatestWith(topic$, region$, onlyEnglish$, onlyFrench$),
            map(([ news, topic, region, onlyEnglish, onlyFrench ]) => this.filterNews(news, topic, region, onlyEnglish, onlyFrench)),
            shareReplay(1),
        );
    }

    private filterNews(news: ElasticNewsItem[], topic: string | undefined, region: string | undefined, onlyEnglish: boolean, onlyFrench: boolean) {
        return news
            .filter(newsItem => {
                if (topic) {
                    const slugifiedTopic = topic.replace(' ', '_').toLowerCase();
                    return newsItem.concepts.some(concept => concept.uri.toLowerCase().includes(slugifiedTopic));
                }

                return true;
            })
            .filter(newsItem => {
                if (region) {
                    return (newsItem.UNESCO_region ?? '').trim() === region;
                }

                return true;
            })
            .filter(newsItem => {
                if (onlyEnglish) {
                    return newsItem.lang === 'eng';
                }

                return true;
            })
            .filter(newsItem => {
                if (onlyFrench) {
                    return newsItem.lang === 'fra';
                }

                return true;
            });
    }

    private setupTags() {
        return this.shownDate$.pipe(
            switchMap(shownDate => {
                const dayAfter = new Date(shownDate);
                dayAfter.setDate(dayAfter.getDate() + 1);

                return this.newsService.getCloudTags(this.sdg()!, this.pilot()!, shownDate, dayAfter, 18)
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
        // Drive the date walk off the rendered news: dwell on days that have news.
        // For OER we visibly animate through empty days too (short dwell) so viewers see the
        // widget is live; for every other pilot/SDG we skip empty days near-instantly so a
        // pilot whose latest news is weeks old doesn't sit on a blank "No news today" screen.
        return this.news$.pipe(
            combineLatestWith(this.paused$),
            switchMap(([ news, paused ]) => {
                // Stopped: hold on the current day until the user starts again. Toggling
                // paused$ re-emits here, so switchMap cancels the pending timer immediately.
                if (paused) {
                    return EMPTY;
                }

                if (news.length) {
                    return timer(this.dwellMs);
                }

                return timer(this.isOer() ? this.oerEmptyDwellMs : this.skipMs);
            }),
            tap(() => {
                const currentDate = new Date(this.shownDate$.value);

                if (currentDate >= this.minDate) {
                    this.shownDate$.next(new Date(currentDate.setDate(currentDate.getDate() - 1)));
                } else {
                    // Restart the rotation: OER walks again from today (visible animation),
                    // others restart at the latest day with news so they don't re-walk the
                    // empty recent days every cycle.
                    this.shownDate$.next(this.isOer() ? new Date() : (this.latestDate ?? new Date()));
                }
            }),
        ).subscribe();
    }

    // The tag cloud sizes each keyword relative to the busiest concept of the day, so a
    // sparse day (every concept appears once) would render every tag at the maximum size.
    // Scale the whole cloud by the busiest concept's absolute count instead, so low-news
    // days look visibly smaller. Relative sizing between tags is preserved.
    public togglePlay() {
        this.paused$.next(!this.paused$.value);
    }

    public cloudVolume(data: CloudData[] | null): number {
        const maxWeight = Math.max(0, ...(data ?? []).map(tag => tag.weight ?? 0));
        const fullVolumeAt = 12;
        const minVolume = 0.45;
        return Math.min(1, Math.max(minVolume, maxWeight / fullVolumeAt));
    }

    private readonly dwellMs = 5000;
    private readonly skipMs = 100;
    private readonly oerEmptyDwellMs = 1500;
    private latestDate?: Date;

    private get minDate() {
        const maxDaysBack = 31;
        return new Date(new Date().setDate(new Date().getDate() - maxDaysBack));
    }
}
