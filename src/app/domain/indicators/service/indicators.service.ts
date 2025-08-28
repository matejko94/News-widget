import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, of } from 'rxjs';
import { environment } from '../../../../../environment/environment';
import { IndicatorIntersectionTimeline } from '../types/indicator-intersection-timeline.interface';
import { IndicatorsIntersections } from '../types/indicator-intersection.interface';

@Injectable({
    providedIn: 'root'
})
export class IndicatorsService {
    private http = inject(HttpClient);

    public getIntersections(sdg: number, year: string, indicator1: string, indicator2: string, indicator3: string) {
        return this.http.get<IndicatorsIntersections>(
            `${ environment.api.url }/indicators/intersection/${ sdg }?year=${ year }&indicator1=${ indicator1 }&indicator2=${ indicator2 }&indicator3=${ indicator3 }`
        ).pipe(
            catchError(e => {
                console.error('Failed to fetch intersecting indicators', e);
                return of({})
            })
        );
    }

    public getIntersectionsTimeline(sdg: number, indicator1: string, indicator2: string, indicator3: string) {
        return this.http.get<IndicatorIntersectionTimeline[]>(
            `${ environment.api.url }/indicators/intersection/linechart/${ sdg }?indicator1=${ indicator1 }&indicator2=${ indicator2 }&indicator3=${ indicator3 }`
        ).pipe(
            catchError(e => {
                console.error('Failed to fetch intersecting indicators linechart', e);
                return of([])
            })
        );
    }


    public getPilotIntersections(pilot: string, year: string, indicator1: string, indicator2: string, indicator3: string) {
        return this.http.get<IndicatorsIntersections>(
            `${ environment.api.url }/indicators/intersection/pilot/${ pilot }?year=${ year }&indicator1=${ indicator1 }&indicator2=${ indicator2 }&indicator3=${ indicator3 }`
        ).pipe(
            catchError(e => {
                console.error('Failed to fetch intersecting indicators', e);
                return of({})
            })
        );
    }

    public getPilotIntersectionsTimeline(pilot: string, indicator1: string, indicator2: string, indicator3: string) {
        return this.http.get<IndicatorIntersectionTimeline[]>(
            `${ environment.api.url }/indicators/intersection/linechart/pilot/${ pilot }?indicator1=${ indicator1 }&indicator2=${ indicator2 }&indicator3=${ indicator3 }`
        ).pipe(
            catchError(e => {
                console.error('Failed to fetch intersecting indicators linechart', e);
                return of([])
            })
        );
    }
}
