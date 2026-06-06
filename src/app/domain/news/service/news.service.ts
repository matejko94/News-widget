import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, concatMap, first, forkJoin, from, map, Observable, of, shareReplay } from 'rxjs';
import { environment } from '../../../../../environment/environment';
import { ElasticNewsItem } from '../../../../../functions/api/news/articles/interface/elastic-news-item';
import { CloudTagResponse } from '../../../../../functions/api/news/tags/interface/cloud-tag-response.interface';
import { Tag } from '../../../../../functions/api/news/tags/interface/tag.interface';
import { NewsOnDateDto } from '../types/news-on-date.dto';
import { TopicDto } from '../types/topic.dto';

@Injectable({
    providedIn: 'root'
})
export class NewsService {
    private http = inject(HttpClient);

    public getNews(sdg: number, pilot: string, shownDate: Date): Observable<ElasticNewsItem[]> {
        return this.http.get<ElasticNewsItem[]>(
            `${ environment.api.newsArticles.url }?sdg=${ sdg }&pilot=${ pilot }&date=${ this.isoDateWithoutTime(shownDate) }`,
            {
                headers: new HttpHeaders({ 'Content-Type': 'application/json' })
            }
        ).pipe(
            catchError(e => {
                console.error('Failed to fetch news', e);
                return of([])
            }),
            shareReplay(1)
        )
    }

    /**
     * Finds the most recent day (<= today, within `maxDaysBack`) that actually has news for
     * the given sdg/pilot. Probes days newest-first in parallel batches and returns the newest
     * day with a hit — so the widget can land straight on data instead of walking day-by-day
     * through empty dates. Returns null if no day in the window has news.
     */
    public getLatestNewsDate(
        sdg: number,
        pilot: string,
        maxDaysBack = 31,
        batchSize = 10,
        today = new Date()
    ): Observable<Date | null> {
        const days = Array.from({ length: maxDaysBack + 1 }, (_, i) => {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            return date;
        });

        const batches: Date[][] = [];
        for (let i = 0; i < days.length; i += batchSize) {
            batches.push(days.slice(i, i + batchSize));
        }

        return from(batches).pipe(
            // Probe each batch (newest-first) in parallel; only continue to the next batch
            // if the current one had no news at all.
            concatMap(batch => forkJoin(
                batch.map(date => this.getNews(sdg, pilot, date).pipe(
                    map(news => ({ date, hasNews: news.length > 0 }))
                ))
            ).pipe(
                map(results => results.find(result => result.hasNews)?.date ?? null)
            )),
            first(date => date !== null, null),
        );
    }

    public getCloudTags(sdg: string, pilot: string, startDate: Date, endDate: Date, limit: number): Observable<Tag[]> {
        return this.http.get<CloudTagResponse>(
            `${ environment.api.tags.url }?startDate=${ this.isoDateWithoutTime(startDate) }&endDate=${ this.isoDateWithoutTime(endDate) }&sdg=${ sdg }&pilot=${ pilot }&limit=${ limit }`
        ).pipe(
            map(response => response.tags),
            catchError(e => {
                console.error('failed to fetch data', e);
                return of([])
            }),
            shareReplay(1)
        )
    }

    public getTopics(wikiConcepts: string[],pilot?: string): Observable<TopicDto[]> {
        return this.http.get<{ topics: TopicDto[] }>(environment.api.topics.url, {
            params: {
                topics: wikiConcepts.join(','),
                pilot: pilot?.replaceAll(' ', '') ?? '' //remove spaces from pilot if exists
            }
        }).pipe(
            map(response => response.topics),
            catchError(e => {
                console.error('Failed to fetch topics', e);
                return of([])
            }),
            shareReplay(1)
        );
    }

    public getNewsIntensity(sdg: string, topic: string | undefined) {
        const params = new URLSearchParams();

        if (topic) {
            params.set('topic', topic);
        }

        return this.http.get<NewsOnDateDto[]>(
            `${ environment.api.url }/news/intensity/${ sdg }?${ params }`
        ).pipe(
            catchError(e => {
                console.error('Failed to fetch news intensity', e);
                return of([])
            })
        );
    }

    public getNewsIntensityPerYear(sdg: string, year: number, topic: string | undefined) {
        const params = new URLSearchParams({ year: year.toString() });

        if (topic) {
            params.set('topic', topic);
        }

        return this.http.get<{ year: string, country: string, value: number }[]>(
            `${ environment.api.url }/news/intensity/yearly/${ sdg }?${ params }`
        ).pipe(
            catchError(e => {
                console.error('Failed to fetch news intensity per year', e);
                return of([])
            })
        );
    }

    //Pilot
    public getNewsIntensityPilot(pilot: string, topic: string | undefined) {
        const params = new URLSearchParams();
        if (topic) {
            params.set('topic', topic);
        }
        return this.http.get<NewsOnDateDto[]>(
            `${ environment.api.url }/news/intensity/pilot/${ pilot }?${ params }`
        ).pipe(
            catchError(e => {
                console.error('Failed to fetch news intensity pilot', e);
                return of([])
            })
        );
    }
    public getNewsIntensityPilotPerYear(pilot: string, year: number, topic: string | undefined) {
            const params = new URLSearchParams({ year: year.toString() });
        if (topic) {
            params.set('topic', topic);
        }
        return this.http.get<{ year: string, country: string, value: number }[]>(
            `${ environment.api.url }/news/intensity/yearly/pilot/${ pilot }?${ params }`
        ).pipe(
            catchError(e => {
                console.error('Failed to fetch news intensity pilot per year', e);
                return of([])
            })
        );
    }

    private isoDateWithoutTime(date: Date) {
        return date.toISOString().split('T')[0] + 'T00:00:00.000Z';
    }
}
