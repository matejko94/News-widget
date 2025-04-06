import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, shareReplay } from 'rxjs';
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

    public getNews(sdg: number, shownDate: Date): Observable<ElasticNewsItem[]> {
        return this.http.get<ElasticNewsItem[]>(
            `${ environment.api.newsArticles.url }?sdg=${ sdg }&date=${ this.isoDateWithoutTime(shownDate) }`,
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

    public getCloudTags(sdg: string, startDate: Date, endDate: Date, limit: number): Observable<Tag[]> {
        return this.http.get<CloudTagResponse>(
            `${ environment.api.tags.url }?startDate=${ this.isoDateWithoutTime(startDate) }&endDate=${ this.isoDateWithoutTime(endDate) }&sdg=${ sdg }&limit=${ limit }`
        ).pipe(
            map(response => response.tags),
            catchError(e => {
                console.error('failed to fetch data', e);
                return of([])
            }),
            shareReplay(1)
        )
    }

    public getTopics(wikiConcepts: string[]): Observable<TopicDto[]> {
        return this.http.get<{ topics: TopicDto[] }>(environment.api.topics.url, {
            params: {
                topics: wikiConcepts.join(',')
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

    private isoDateWithoutTime(date: Date) {
        return date.toISOString().split('T')[0] + 'T00:00:00.000Z';
    }
}
