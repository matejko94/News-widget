import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, of } from 'rxjs';
import { environment } from '../../../../../environment/environment';
import { NewsOnDateDto } from '../../news/types/news-on-date.dto';
import { EventSdgsDto } from '../types/event-sdgs.dto';

@Injectable({
    providedIn: 'root'
})
export class EducationService {
    private http = inject(HttpClient);

    public getEventSdgs(sdg: number | undefined, topic: string | undefined) {
        const params = new URLSearchParams();

        if (sdg !== undefined) {
            params.set('sdg', sdg.toString());
        }

        if (topic) {
            params.set('topic', topic);
        }

        return this.http.get<EventSdgsDto>(
            `${ environment.api.url }/education/whitespace?${ params }`
        ).pipe(
            catchError(e => {
                console.error('Failed to fetch news intensity', e);
                return of({
                    events: [],
                    sdgs: [],
                    similarities: []
                })
            })
        );
    }

    public getPilotEvent(pilot: string, topic: string | undefined) {
        const params = new URLSearchParams();

        if (topic) {
            params.set('topic', topic);
        }

        return this.http.get<EventSdgsDto>(
            `${ environment.api.url }/education/whitespace/pilot/${ pilot }?${ params }`
        ).pipe(
            catchError(e => {
                console.error('Failed to fetch pilot event sdgs', e);
                return of({ events: [], sdgs: [], similarities: [] })
            })
        );
    }
}
