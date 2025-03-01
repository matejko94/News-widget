import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, of } from 'rxjs';
import { environment } from '../../../../../environment/environment';
import { IndustryCollaborationResponseDto } from '../types/industry-collaboration-response.dto';

@Injectable({
    providedIn: 'root'
})
export class InnovationsService {
    private http = inject(HttpClient);

    public getIndustryCollaborations(sdg: number, topic: string | undefined) {
        const params = new URLSearchParams();

        if (topic) {
            params.set('topic', topic);
        }

        return this.http.get<IndustryCollaborationResponseDto>(
            `${ environment.api.url }/innovation/collaborations/${ sdg }` + (params.size ? `?${ params }` : '')
        ).pipe(
            catchError(e => {
                console.error('Failed to fetch industry collaborations', e);
                return of({ nodes: [], edges: [] })
            })
        );
    }

    public getInnovationIntersections(sdg: number, region: string | undefined) {

    }
}
