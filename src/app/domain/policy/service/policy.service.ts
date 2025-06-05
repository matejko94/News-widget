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

    public getIntersectingSdgPolicies(sdg: number | undefined, region: string | undefined, limit: number): Observable<IntersectingPolicyDto[]> {
        const params = new URLSearchParams({
            region_code: region ?? 'All',
            limit: limit.toString()
        });
        
        if (sdg !== undefined) {
            params.set('sdg', sdg.toString());
        }

        return this.http.get<IntersectingPolicyDto[]>(
            `${ environment.api.url }/policy/intersection?${ params }`
        ).pipe(
            catchError(e => {
                console.error('Failed to fetch intersecting policies', e);
                return of([])
            })
        );
    }

    public getRadarData(sdg: number | undefined, region: string | undefined, year: number): Observable<RadarDto[]> {
        const params = new URLSearchParams({
            year: year.toString(),
            region_code: region ?? 'All'
        });

        if (sdg !== undefined) {
            params.set('sdg', sdg.toString());
        }

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
