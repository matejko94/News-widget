import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { environment } from '../../../../../environment/environment';
import { IntersectingPolicyDto } from '../types/intersecting-policy.dto';

@Injectable({
    providedIn: 'root'
})
export class PolicyService {
    private http = inject(HttpClient);

    public getIntersectingSdgPolicies(sdg: number, region: string | undefined, limit: number): Observable<IntersectingPolicyDto[]> {
        console.log('Fetching intersecting policies for SDG', sdg);
        const query = new URLSearchParams({ limit: limit.toString() });

        if (region) {
            query.set('region_code', region);
        }

        return this.http.get<IntersectingPolicyDto[]>(
            `${ environment.api.url }/policy/intersection/${ sdg }?${ query }`
        ).pipe(
            catchError(e => {
                console.error('Failed to fetch intersecting policies', e);
                return of([])
            })
        );
    }
}
