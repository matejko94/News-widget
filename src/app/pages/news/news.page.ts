import { AsyncPipe, DatePipe, SlicePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { CloudData, TagCloudComponent } from 'angular-tag-cloud-module';
import { Checkbox } from 'primeng/checkbox';
import { BehaviorSubject, combineLatestWith, EMPTY, filter, map, Observable, shareReplay, switchMap, tap, timer } from 'rxjs';
import { OER_ACTION_AREA_NAMES, OER_ACTION_AREA_STYLES, OER_ACTION_AREAS, OER_ALL_PILOT, oerActionAreasOf } from '../../../../configuration/pilot/oer-action-areas';
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
            --size: 12;
            --unit: calc(var(--size) * 1%);

            @media (max-width: 1000px) {
                --size: 8;
            }

            @media (max-width: 800px) {
                --size: 6;
            }

            @media (max-width: 600px) {
                --size: 5;
            }

            /* A narrow band: the largest keyword is about half again the smallest, so a busier
               concept still reads as bigger without the cloud swinging between giant and tiny.
               Steps 4..10 are the ones tagSizeBucket() actually assigns. Sizes are also what
               decides how many of the 18 keywords fit — the library drops any it cannot place —
               so the band is kept just below the point where the cloud starts shedding them. */
            span.w10 {
                font-size: calc(var(--unit) * 25);
            }

            span.w9 {
                font-size: calc(var(--unit) * 23.5);
            }

            span.w8 {
                font-size: calc(var(--unit) * 22);
            }

            span.w7 {
                font-size: calc(var(--unit) * 20.5);
            }

            span.w6 {
                font-size: calc(var(--unit) * 19);
            }

            span.w5 {
                font-size: calc(var(--unit) * 18);
            }

            span.w4 {
                font-size: calc(var(--unit) * 17);
            }

            span.w3 {
                font-size: calc(var(--unit) * 16);
            }

            span.w2 {
                font-size: calc(var(--unit) * 15.5);
            }

            span.w1 {
                font-size: calc(var(--unit) * 15);
            }
        }
    `,
    template: `
        <app-heatmap [newsItems]="news$ | async" [zoom]="2" [mapHeight]="'auto'"
                     [location]="{ lat: 40, lng: 0}" [mapCircleRadiusFactor]="1.5"/>

        @let news = news$ | async;
        @let data = cloudData$ | async;
        <div class="flex items-center gap-2 p-2">
            @let periodName = isWeekly() ? 'week' : 'day';
            <div class="flex items-center">
                <button type="button" (click)="stepPeriod(-1)"
                        class="flex items-center justify-center w-7 h-7 rounded hover:bg-gray-200 transition-colors"
                        [attr.aria-label]="'Previous ' + periodName" [title]="'Previous ' + periodName">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M15 6l-6 6 6 6z"/></svg>
                </button>
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
                <button type="button" (click)="stepPeriod(1)"
                        class="flex items-center justify-center w-7 h-7 rounded hover:bg-gray-200 transition-colors"
                        [attr.aria-label]="'Next ' + periodName" [title]="'Next ' + periodName">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 6l6 6-6 6z"/></svg>
                </button>
            </div>
            @let loadedDate = loadedDate$ | async;
            @if (isWeekly()) {
                <div>Week: <b>{{ windowStart(loadedDate!) | date: 'dd.MM' }} – {{ loadedDate | date: 'dd.MM.yyyy' }}</b></div>
            } @else {
                <div>Date: <b>{{ loadedDate | date: 'dd.MM.yyyy' }}</b></div>
            }
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
                        <div class="flex items-baseline flex-wrap gap-2 text-gray-500 text-lg">
                            <span>{{ newsItem.dateTime | date: 'EEE MMM d yyyy, HH:mm': 'UTC' }}</span>
                            <!-- Which OER action area(s) the article was identified in. Only in
                                 OER-all, where the list mixes all five. -->
                            @if (isOerAll()) {
                                @for (area of actionAreasOf(newsItem); track area) {
                                    <span class="rounded px-1.5 text-base font-semibold"
                                          [title]="actionAreaNames[area]"
                                          [style.background]="actionAreaStyles[area].background"
                                          [style.color]="actionAreaStyles[area].color">{{ area }}</span>
                                }
                            }
                        </div>
                    </div>
                } @empty {
                    <div class="h-full w-fit text-xl font-semibold text-gray-600 my-10 mx-auto">
                        No news {{ periodLabel() }}
                    </div>
                }
            </div>

            <div class="overflow-visible flex flex-col items-center">
                @if (data?.length) {
                    <angular-tag-cloud [height]="360" [realignOnResize]="true" [data]="data!" class="-mt-6 cloud"
                                       [overflow]="false" [strict]="true" [width]="cloudWidth"/>
                } @else {
                    <div class="h-full w-fit text-xl font-semibold text-gray-600 my-10 mx-auto">
                        No keywords {{ periodLabel() }}
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

    // OER aggregates a whole week per step; every other pilot/SDG stays day-by-day.
    // shownDate$/loadedDate$ hold the newest (end) day of the window, so the walk still moves
    // backwards from the latest day with news — one week at a time instead of one day.
    public readonly windowDays = computed(() => this.isOer() ? 7 : 1);
    public readonly isWeekly = computed(() => this.windowDays() > 1);
    public readonly periodLabel = computed(() => this.isWeekly() ? 'this week' : 'today');

    public readonly isOerAll = computed(() => (this.pilot() ?? '').trim().toUpperCase() === OER_ALL_PILOT.toUpperCase());

    // OER-all is built from the five action areas rather than from its own data stream: query all
    // five at once, so an article that belongs to several of them is returned once and can be
    // labelled with each area it matches. The OER-all stream itself stays in the system.
    public readonly newsPilot = computed(() => this.isOerAll() ? OER_ACTION_AREAS.join(',') : this.pilot()!);
    public readonly actionAreaStyles = OER_ACTION_AREA_STYLES;
    public readonly actionAreaNames = OER_ACTION_AREA_NAMES;

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
    // The cloud fills its own column. A width of 1 or less is a fraction of the parent element,
    // which the library re-measures on resize, so the cloud tracks the column instead of being
    // guessed from the window width — the old guess left it without a width until the first
    // resize, and could reach past the column's edge.
    public readonly cloudWidth = 1;

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
    private jumpToLatestNewsDate() {
        this.newsService.getLatestNewsDate(+this.sdg()!, this.newsPilot()).subscribe(latestDate => {
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
            switchMap(shownDate => this.newsService.getNewsForWindow(+this.sdg()!, this.newsPilot(), shownDate, this.windowDays())),
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

                // Keywords cover the same window as the news list: a single day normally,
                // the whole week for OER.
                return this.newsService.getCloudTags(this.sdg()!, this.newsPilot(), this.windowStart(shownDate), dayAfter, 18)
            }),
            map(tags => tags.map(tag => ({ ...tag, weight: this.tagSizeBucket(tag.weight) }))),
            shareReplay(1),
        )
    }

    // How large a keyword renders, from its absolute number of mentions.
    //
    // The cloud runs in `strict` mode so that this mapping decides the size. Left to itself the
    // library stretches whatever spread a window happens to have across its full w1..w10 range,
    // which is what made the cloud restless: in a quiet week counts of 4 and 2 were drawn as far
    // apart as counts of 50 and 1 in a busy one, and the same concept changed size from week to
    // week for no reason a reader could see. Mentions map to a fixed step here, so a concept
    // mentioned four times looks the same in every window.
    //
    // The steps are coarse at the top because counts have a long tail — real windows range from
    // about 1 to 13 mentions, with the occasional busy one far above that.
    private tagSizeBucket(mentions: number): number {
        const steps = [ 2, 3, 5, 8, 12, 18 ];
        return steps.filter(step => mentions >= step).length + 4;
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
        // Drive the walk off the rendered news: dwell on periods that have news, but skip empty
        // ones near-instantly so a pilot whose latest news is weeks old doesn't sit on a blank
        // "No news" screen. The dwell applies to the filtered result, so an active region/topic
        // filter also skips straight to periods that have matching news. A period is one day
        // normally and one week for OER (windowDays).
        return this.news$.pipe(
            combineLatestWith(this.paused$),
            switchMap(([ news, paused ]) => {
                // Stopped: hold on the current day until the user starts again. Toggling
                // paused$ re-emits here, so switchMap cancels the pending timer immediately.
                if (paused) {
                    return EMPTY;
                }

                return timer(news.length ? this.dwellMs : this.skipMs);
            }),
            tap(() => {
                const currentDate = new Date(this.shownDate$.value);

                if (currentDate >= this.minDate) {
                    this.shownDate$.next(new Date(currentDate.setDate(currentDate.getDate() - this.windowDays())));
                } else {
                    // Restart the rotation at the latest day with news (not today), so we
                    // don't re-walk the empty recent days every cycle.
                    this.shownDate$.next(this.latestDate ?? new Date());
                }
            }),
        ).subscribe();
    }

    public togglePlay() {
        this.paused$.next(!this.paused$.value);
    }

    // Manual step: -1 goes back one period (older), +1 forward one period (newer). A period is
    // one day normally and one week for OER. Stepping pauses the auto-walk so the chosen period
    // stays put, and the anchor is clamped to the same [minDate, today] window the walk uses.
    public stepPeriod(delta: number) {
        if (this.isLoading$.value) {
            return;
        }

        this.paused$.next(true);

        const next = new Date(this.shownDate$.value);
        next.setDate(next.getDate() + delta * this.windowDays());

        const today = new Date();
        if (next < this.minDate || next > today) {
            return;
        }

        this.shownDate$.next(next);
    }

    // The OER action areas an article was identified in, for the labels next to its date.
    public actionAreasOf(newsItem: ElasticNewsItem) {
        return oerActionAreasOf(newsItem.pilot);
    }

    // First (oldest) day of the window ending on `endDate` — the window is a single day
    // normally, and the preceding 7 days for OER.
    public windowStart(endDate: Date) {
        const start = new Date(endDate);
        start.setDate(start.getDate() - (this.windowDays() - 1));
        return start;
    }

    private readonly dwellMs = 5000;
    private readonly skipMs = 100;
    private latestDate?: Date;

    private get minDate() {
        const maxDaysBack = 31;
        return new Date(new Date().setDate(new Date().getDate() - maxDaysBack));
    }
}
