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

    public getTopTopicsPerYear(sdg: number | undefined, limit: number): Observable<TopTopicsPerYear[]> {
        const params = new URLSearchParams({
            limit: limit.toString()
        });
        
        if (sdg !== undefined) {
            params.set('sdg', sdg.toString());
        }

        return this.http.get<TopTopicsPerYear[]>(
            `${ environment.api.url }/science/timespan?${ params }`
        ).pipe(
            catchError(e => {
                console.error('Failed to fetch science top topics per year', e);
                return of([])
            })
        );
    }

    public getTopicEvolution(sdg: number, topic: string | undefined, year: number): Observable<EvolutionLinkDto[]> {
        const params = new URLSearchParams({ year: year.toString() });

        if (topic) {
            params.set('topic', topic);
        }

        return this.http.get<EvolutionLinkDto[]>(
            `${ environment.api.url }/science/evolution/${ sdg }?${ params }`
        ).pipe(
            catchError(e => {
                console.error('Failed to fetch science topic evolution', e);
                return of([])
            })
        );
    }
}
