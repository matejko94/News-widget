import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {catchError, map, Observable, of, shareReplay} from 'rxjs';
import {ScienceItem} from "../domain/news/entity/science-item.interface";
import {ScienceDto} from "../domain/news/entity/science-dto.interface";
import {environment} from "../../environment/environment";

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private apiUrl = 'https://api.example.com/data'; // Replace with your API URL

  constructor(private http: HttpClient) { }

  getData(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

   getScience(sdg: string): Observable<ScienceItem[]> {
        return this.http.post<ScienceDto>(
            environment.api.science.url,
            {
                "size": 0,
                "query": {
                    "bool": {
                        "filter": [
                            {
                                "match": {
                                    "SDG.keyword": `SDG ${sdg}`
                                }
                            }
                        ]
                    }
                },
                "aggs": {
                    "countries": {
                        "terms": {
                            "field": "authorships.institutions.country_code.keyword",
                            "size": 200
                        }
                    }
                }
            },
            {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + environment.api.science.auth,
                }),
            }).pipe(
            map(response => response.aggregations.countries.buckets),
            catchError(e => {
                console.error('failed to fetch data', e);
                return of([])
            }),
            shareReplay(1)
        )
    }

   getInnovations(sdg: string): Observable<ScienceItem[]> {
        return this.http.post<ScienceDto>(
            environment.api.innovation.url,
                    {
                       "size":0,
                       "query":{
                          "wildcard":{
                             "SDG.keyword":`*SDG ${sdg}*`
                          }
                       },
                       "aggs":{
                          "countries":{
                             "terms":{
                                "field":"country",
                                "size":10
                             }
                          }
                       }
                    },
            {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + environment.api.innovation.auth,
                }),
            }).pipe(
            map(response => response.aggregations.countries.buckets),
            catchError(e => {
                console.error('failed to fetch data', e);
                return of([])
            }),
            shareReplay(1)
        )
    }

    getScienceCount(sdg: string): Observable<number> {
        return this.http.post<{count: number}>(
            environment.api.science_count.url,
            {
                "query": {
                    "bool": {
                        "must": [
                            {
                                "term": {
                                    "SDG.keyword": `SDG ${sdg}`
                                }
                            }
                        ]
                    }
                }
            },
            {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + environment.api.science_count.auth,
                }),
            }).pipe(
            map(response => response.count),
            catchError(e => {
                console.error('failed to fetch data', e);
                return of(0)
            }),
            shareReplay(1)
        )
    }

    getScienceAllCount(sdg: string): Observable<number> {
        return this.http.post<{count: number}>(
            environment.api.science_count.url,
            {
                "query": {
                    "bool": {
                        "must": [
                        ]
                    }
                }
            },
            {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + environment.api.science_count.auth,
                }),
            }).pipe(
            map(response => response.count),
            catchError(e => {
                console.error('failed to fetch data', e);
                return of(0)
            }),
            shareReplay(1)
        )
    }

   getMediaCount(sdg: string): Observable<number> {
        return this.http.post<{count: number}>(
            environment.api.media_count.url,
            {
                "query": {
                    "bool": {
                        "must": [
                            {
                                "term": {
                                    "SDG.keyword": `SDG ${sdg}`
                                }
                            }
                        ]
                    }
                }
            },
            {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + environment.api.media_count.auth,
                }),
            }).pipe(
            map(response => response.count),
            catchError(e => {
                console.error('failed to fetch data', e);
                return of(0)
            }),
            shareReplay(1)
        )
   }

   getMediaByCountryCount(sdg: string): Observable<ScienceItem[]> {
        return this.http.post<ScienceDto>(
            environment.api.news.url,
            {
                "size": 0,
                "query": {
                    "bool": {
                        "filter": [
                            {
                                "match": {
                                    "SDG.keyword": `SDG ${sdg}`
                                }
                            }
                        ]
                    }
                },
                "aggs": {
                    "countries": {
                        "terms": {
                            "field": "concepts.location.label.eng.keyword",
                            "size": 10
                        }
                    }
                }
            },
            {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + environment.api.news.auth,
                }),
            }).pipe(
            map(response => response.aggregations.countries.buckets),
            catchError(e => {
                console.error('failed to fetch data', e);
                return of([])
            }),
            shareReplay(1)
        )
   }

   getPolicyCount(sdg: string): Observable<number> {
        return this.http.post<{count: number}>(
            environment.api.policy_count.url,
            {
                "query": {
                    "bool": {
                        "must": [
                            {
                                "term": {
                                    "SDG.keyword": `SDG ${sdg}`
                                }
                            }
                        ]
                    }
                }
            },
            {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + environment.api.policy_count.auth,
                }),
            }).pipe(
            map(response => response.count),
            catchError(e => {
                console.error('failed to fetch data', e);
                return of(0)
            }),
            shareReplay(1)
        )
   }

}