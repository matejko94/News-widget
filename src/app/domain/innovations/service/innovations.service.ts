import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { of } from 'rxjs';
import { WorldBankRegions } from '../../../../../configuration/regions/world-regions';
import { IndustryCollaborationDto } from '../types/industry-collaboration.dto';

@Injectable({
    providedIn: 'root'
})
export class InnovationsService {
    private http = inject(HttpClient);

    public getIndustryCollaborations(sdg: number, topic: string | undefined, limit: number) {
        return of(this.generateMockCollaborationData(limit));
    }

    private generateMockCollaborationData(num: number): IndustryCollaborationDto[] {
        const data = Array.from({ length: num }).map((_, i) => {
            const SDGS = Array.from({ length: Math.floor(Math.random() * 17) + 1 }, (_, i) => `SDG ${ i + 1 }`);
            const randomAmountOfSdgs = Math.floor(Math.random() * 2) + 1;
            const sdgs = [];

            for (let i = 0; i < randomAmountOfSdgs; i++) {
                sdgs.push(SDGS[Math.floor(Math.random() * SDGS.length)]);
            }

            const randomRegion = WorldBankRegions[Math.floor(Math.random() * WorldBankRegions.length)];

            return {
                industry: 'Industry ' + i,
                country: 'Country ' + i,
                region: randomRegion.value,
                sdgs
            };
        });

        return data;
    }
}
