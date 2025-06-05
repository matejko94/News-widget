import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, of } from 'rxjs';
import { environment } from '../../../../../environment/environment';
import { IndustryCollaborationResponseDto } from '../types/industry-collaboration-response.dto';
import { InnovationResponseDto } from '../types/innovation-response.dto';

@Injectable({
    providedIn: 'root'
})
export class InnovationsService {
    private http = inject(HttpClient);

    public getIndustryCollaborations(sdg: number | undefined, topic: string | undefined) {
        const params = new URLSearchParams();

        if (topic) {
            params.set('topic', topic);
        }

        if (sdg !== undefined) {
            params.set('sdg', sdg.toString());
        }

        return this.http.get<IndustryCollaborationResponseDto>(
            `${ environment.api.url }/innovation/collaborations` + (params.size ? `?${ params }` : '')
        ).pipe(
            catchError(e => {
                console.error('Failed to fetch industry collaborations', e);
                return of({ nodes: [], edges: [] })
            })
        );
    }

    public getIntersections(sdg: number | undefined) {
        const params = new URLSearchParams();

        if (sdg !== undefined) {
            params.set('sdg', sdg.toString());
        }

        return this.http.get<InnovationResponseDto>(
            `${ environment.api.url }/innovation/sdg` + (params.size ? `?${ params }` : '')
        ).pipe(
            catchError(e => {
                console.error('Failed to fetch industry collaborations', e);
                return of({ nodes: [], links: [] })
            })
        );
    }
}
