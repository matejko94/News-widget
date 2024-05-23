import { inject, Injectable } from "@angular/core";
import { CloudDataDto } from "../entity/cloud-data-dto.interface";
import { catchError, map, Observable, of, shareReplay } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { CloudItem } from "../entity/cloud-item.interface";
import { NewsItem } from "../entity/news-item.interface";
import { NewsDto } from "../entity/news-dto.interface";
import { environment } from "../../../environment";

@Injectable({
    providedIn: 'root'
})
export class NewsService {
    private http = inject(HttpClient);

    public getCloudData(topicKey: string): Observable<CloudItem[]> {
        return this.http.get<CloudDataDto>(`${environment.api.cloudTag.url}?topicKey=${ topicKey }`)
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
                }),
            }).pipe(
            map(response => response.hits.hits),
            catchError(e => {
                console.error('failed to fetch data', e);
                return of([])
            }),
            shareReplay(1)
        )
    }
}
