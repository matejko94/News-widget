import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { environment } from '../../../../../environment/environment';
import { IntersectingPolicyDto } from '../types/intersecting-policy.dto';
import { RadarDto } from '../types/radar.dto';

@Injectable({
    providedIn: 'root'
})
export class PolicyService {
    private http = inject(HttpClient);

    public getIntersectingSdgPolicies(sdg: number, region: string | undefined, limit: number): Observable<IntersectingPolicyDto[]> {
        return this.http.get<IntersectingPolicyDto[]>(
            `${ environment.api.url }/policy/intersection?sdg=${ sdg }&region_code=${ region ?? 'All' }&limit=${ limit }`
        ).pipe(
            catchError(e => {
                console.error('Failed to fetch intersecting policies', e);
                return of([])
            })
        );
    }

    public getRadarData(sdg: number, region: string | undefined, year: number): Observable<RadarDto[]> {
        const params = new URLSearchParams({
            sdg: sdg.toString(),
            year: year.toString(),
            region_code: region ?? 'All'
        });

        return this.http.get<RadarDto[]>(
            `${ environment.api.url }/policy/radar?${ params }`
        ).pipe(
            catchError(e => {
                console.error('Failed to fetch radar data', e);
                return of([])
            })
        );
    }
}
