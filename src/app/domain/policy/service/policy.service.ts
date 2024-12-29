import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { PolicyAggregateDto } from '../types/policy-aggregate.dto';

@Injectable({
    providedIn: 'root'
})
export class PolicyService {

    public getPolicies(topics: string[]): Observable<PolicyAggregateDto[]> {
        return of(Array
            .from({ length: 17 })
            .map((_, i) => topics.map(t => ({ sdg: i, name: t, count: Math.floor(Math.random() * 100) })))
            .flat()
        ).pipe(
            delay(500)
        );
    }
}
