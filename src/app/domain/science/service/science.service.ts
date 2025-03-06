import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { environment } from '../../../../../environment/environment';
import { EvolutionLinkDto } from '../types/evolution-link.dto';
import { TopTopicsPerYear } from '../types/topic-timespan.interface';

@Injectable({
    providedIn: 'root'
})
export class ScienceService {
    private http = inject(HttpClient);

    public getTopTopicsPerYear(sdg: number, limit: number): Observable<TopTopicsPerYear[]> {
        return this.http.get<TopTopicsPerYear[]>(
            `${ environment.api.url }/science/timespan?sdg=${ sdg }&limit=${ limit }`
        ).pipe(
            catchError(e => {
                console.error('Failed to fetch science top topics per year', e);
                return of([])
            })
        );
    }

    public getTopicEvolution(sdg: number, topic: string, year: number): Observable<EvolutionLinkDto[]> {
        return this.http.get<EvolutionLinkDto[]>(
            `${ environment.api.url }/science/evolution/${ sdg }?topic=${ topic }&year=${ year }`
        ).pipe(
            catchError(e => {
                console.error('Failed to fetch science topic evolution', e);
                return of([])
            })
        );
    }
}
