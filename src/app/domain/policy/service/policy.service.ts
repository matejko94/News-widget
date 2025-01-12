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

    public getIntersectingSdgPolicies(sdg: number, limit: number): Observable<IntersectingPolicyDto[]> {
        return this.http.get<IntersectingPolicyDto[]>(
            `${ environment.api.url }/policy/intersection/${ sdg }?limit=${ limit }`
        ).pipe(
            catchError(e => {
                console.error('Failed to fetch intersecting policies', e);
                return of([])
            })
        );
    }
}
