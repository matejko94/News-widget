import { AsyncPipe } from '@angular/common';
import { Component, inject, input, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { combineLatest, combineLatestWith, filter, map, Observable, switchMap, tap } from 'rxjs';
import { WorldBankRegions } from '../../../../configuration/regions/world-regions';
import { InnovationsService } from '../../domain/innovations/service/innovations.service';
import { InnovationResponseDto } from '../../domain/innovations/types/innovation-response.dto';
import { ChordChartComponent, ChordChartData } from '../../ui/charts/chord-chart/chord-chart.component';
import { Option } from '../../ui/components/menu/menu.component';
import { MultiMenuComponent } from '../../ui/components/multi-menu/multi-menu.component';
import { BasePage } from '../base.page';

@Component({
    selector: 'collaboration-page',
    standalone: true,
    imports: [
        ChordChartComponent,
        AsyncPipe,
        MultiMenuComponent,
    ],
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
            height: 100%;
        }
    `,
    template: `
        <div class="flex justify-end items-center w-full mt-3 mb-5 pr-4">
            <app-multi-menu queryParam="industries" label="Industry" [options]="industryOptions()"/>
        </div>

        @if (data$ | async; as data) {
            <app-chord-chart [data]="data" class="w-full flex-1 min-h-0"/>
        }
    `
})
export default class InnovationsPage extends BasePage {
    private innovationsService = inject(InnovationsService);

    public industries = input(null, { transform: (query: string | null) => query?.split(',') ?? null });
    public industryOptions = signal<Option[]>([]);
    public data$: Observable<ChordChartData>;

    constructor() {
        super();
        this.data$ = this.setupHeatMapData();
    }

    private setupHeatMapData(): Observable<ChordChartData> {
        return combineLatest([
            toObservable(this.sdg),
            toObservable(this.pilot),
        ]).pipe(
            switchMap(([ sdg, pilot ]) => {
                // Use pilot intersections if pilot is available, otherwise fall back to sdg intersections
                if (pilot && pilot !== null) {
                    return this.innovationsService.getPilotIntersections(pilot, undefined);
                } else {
                    return this.innovationsService.getIntersections(sdg ? +sdg : undefined);
                }
            }),
            tap(data => this.setIndustryOptions(data)),
            combineLatestWith(toObservable(this.industries)),
            map((([ data, industries ]) => this.toChordData(data, industries))),
        );
    }

    private toChordData({ links }: InnovationResponseDto, industries: string[] | null): ChordChartData {
        const groups = WorldBankRegions.map(region => ({
            name: region.label,
            color: region.color
        }));

        const linksData = links
            .filter(link => {
                if (!industries?.length) {
                    return true;
                }

                const sourceIndustry = link.source.split('|')[0];
                const targetIndustry = link.target.split('|')[0];

                return industries.includes(sourceIndustry) || industries.includes(targetIndustry);
            })
            .map(link => ({
                source: {
                    group: link.source.split('|')[1],
                    subGroup: link.source.split('|')[0]
                },
                target: {
                    group: link.target.split('|')[1],
                    subGroup: link.target.split('|')[0]
                },
                commonValues: link.common_sdgs
            }));

        return { groups, links: linksData };
    }

    private setIndustryOptions({ nodes }: InnovationResponseDto) {
        const uniqueIndustries = [...new Set(nodes.map(node => node.industry))];

        this.industryOptions.set(uniqueIndustries.map(industry => ({
            label: industry,
            value: industry
        })));
    }
}
