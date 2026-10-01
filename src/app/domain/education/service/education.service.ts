import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { environment } from '../../../../../environment/environment';
import { NewsOnDateDto } from '../../news/types/news-on-date.dto';
import { EventSdgsDto } from '../types/event-sdgs.dto';
import { SegmentDocumentsDto } from '../types/segment-document.dto';

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

    /**
     * One page of the lectures counted in a radial segment. `total` matches the value the radial
     * shows for that segment, and each document carries a VideoLectures `url`.
     *
     * In the pilot view `pilot` is the selected pilot field (e.g. OER-all) and `key` the stack
     * key within it (OER1..OER5); in the SDG view `key` is the SDG label ("SDG 4") and `pilot`
     * is left out.
     */
    public getSegmentDocuments(
        topic: string,
        key: string,
        pilot: string | undefined,
        page: number,
        pageSize = 20
    ): Observable<SegmentDocumentsDto | null> {
        const params = new URLSearchParams({
            topic,
            page: page.toString(),
            page_size: pageSize.toString()
        });

        let url: string;

        if (pilot) {
            params.set('key', key);
            url = `${ environment.api.url }/education/intersection/pilot/${ pilot }/documents`;
        } else {
            params.set('sdg', key);
            url = `${ environment.api.url }/education/intersection/documents`;
        }

        return this.http.get<SegmentDocumentsDto>(`${ url }?${ params }`).pipe(
            catchError(e => {
                console.error('Failed to fetch segment documents', e);
                return of(null);
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
