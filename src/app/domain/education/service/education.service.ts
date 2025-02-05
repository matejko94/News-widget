import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { of } from 'rxjs';
import { EventSdgsDto } from '../types/event-sdgs.dto';

@Injectable({
    providedIn: 'root'
})
export class EducationService {
    private http = inject(HttpClient);

    public getEventSdgs(sdg: number, topic: string | undefined, limit: number) {
        return of(this.generateMockEventData(limit));
    }

    private generateMockEventData(num: number): EventSdgsDto[] {
        const data = Array.from({ length: num }).map((_, i) => {
            const SDGS = Array.from({ length: Math.floor(Math.random() * 17) + 1 }, (_, i) => `SDG ${ i + 1 }`);
            const randomAmountOfSdgs = Math.floor(Math.random() * 2) + 1;
            const sdgs = [];

            for (let i = 0; i < randomAmountOfSdgs; i++) {
                sdgs.push(SDGS[Math.floor(Math.random() * SDGS.length)]);
            }
            const randomMainSdg = sdgs[Math.floor(Math.random() * sdgs.length)];

            return {
                event: 'Event ' + i,
                main_sdg: randomMainSdg,
                sdgs
            };
        });

        return data;
    }
}
