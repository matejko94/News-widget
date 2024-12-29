import {inject, Injectable} from "@angular/core";
import {catchError, map, Observable, of, shareReplay} from "rxjs";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../../../../environment/environment";
import {Tag} from "../../../../../functions/api/news/tags/interface/tag.interface";
import {CloudTagResponse} from "../../../../../functions/api/news/tags/interface/cloud-tag-response.interface";
import {NewsItem} from "../types/news-item.interface";
import {NewsDto} from "../types/news-dto.interface";
import { TopicDto } from '../types/topic.dto';

@Injectable({
    providedIn: 'root'
})
export class NewsService {
    private http = inject(HttpClient);

    public getCloudData(sdg: string, startDate: Date, endDate: Date, limit: number): Observable<Tag[]> {
        return this.http.get<CloudTagResponse>(
            `${environment.api.tags.url}?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&sdg=${sdg}&limit=${limit}`
        ).pipe(
            map(response => response.tags),
            catchError(e => {
                console.error('failed to fetch data', e);
                return of([])
            }),
            shareReplay(1)
        )
    }

    public getNews(shownDate: Date, sdg: string): Observable<NewsItem[]> {
        return this.http.post<NewsDto>(
            environment.api.news.url,
            {
                "size": 10000,
                "query": {
                    "bool": {
                        "must": [
                            {
                                "match": {
                                    "SDG.keyword": `SDG ${ sdg }`
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
                    'Authorization': 'Basic ' + environment.api.news.auth,
                })
            }).pipe(
            map(response => response.hits.hits),
            catchError(e => {
                console.error('Failed to fetch news', e);
                return of([])
            }),
            shareReplay(1)
        )
    }

    public getTopics(wikiConcepts: string[]): Observable<TopicDto[]> {
        return this.http.get<{topics:TopicDto[]}>(environment.api.topics.url, {
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
}
