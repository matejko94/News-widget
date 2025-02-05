import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { combineLatest, map, Observable } from 'rxjs';
import { getRegionColor } from '../../../../configuration/regions/world-regions';
import { loadingMap } from '../../common/utility/loading-map';
import { InnovationsService } from '../../domain/innovations/service/innovations.service';
import { IndustryCollaborationDto } from '../../domain/innovations/types/industry-collaboration.dto';
import { ForceData, ForceDirectedChartComponent, ForceLink, ForceNode } from '../../ui/charts/force-directed-chart/force-directed-chart.component';
import { MenuComponent } from '../../ui/components/menu/menu.component';
import { BasePage } from '../base.page';

@Component({
    selector: 'collaboration-page',
    standalone: true,
    imports: [
        MenuComponent,
        ForceDirectedChartComponent,
        AsyncPipe,
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
            <app-menu queryParam="topic" label="Topic" [options]="topicOptions()"/>
        </div>
        @if (data$ | async; as data) {
            <app-force-directed-chart [data]="data" tagLabel="Country" class="w-full flex-1 min-h-0"/>
        }
    `,
})
export default class CollaborationPage extends BasePage implements OnInit {
    private innovationsService = inject(InnovationsService);
    public data$!: Observable<ForceData | undefined>;
    private linkCounts = new Map<string, number>();

    public override ngOnInit() {
        super.ngOnInit();

        this.data$ = combineLatest([
            toObservable(this.sdg, { injector: this.injector }),
            toObservable(this.topic, { injector: this.injector }),
        ]).pipe(
            loadingMap(([ sdg, topic ]) => this.innovationsService.getIndustryCollaborations(+sdg, topic, 100)),
            map(data => data ? this.mapData(data) : undefined)
        );
    }

    private mapData(data: IndustryCollaborationDto[]): ForceData {
        this.linkCounts.clear();

        const links = this.mapLinks(data);
        const nodes = this.mapNodes(data);

        return { nodes, links };
    }

    private mapNodes(data: IndustryCollaborationDto[]): ForceNode[] {
        return data.map((evt) => ({
            id: evt.industry,
            group: evt.region,
            tag: evt.country,
            totalLinks: this.linkCounts.get(evt.industry) ?? 0,
            color: getRegionColor(evt.region),
        }));
    }

    private mapLinks(data: IndustryCollaborationDto[]): ForceLink[] {
        const industrySdgsMap = new Map<string, Set<string>>();
        data.forEach((evt) => industrySdgsMap.set(evt.industry, new Set(evt.sdgs)));

        const links: ForceLink[] = [];
        for (let i = 0; i < data.length; i++) {
            for (let j = i + 1; j < data.length; j++) {
                const industryA = data[i].industry;
                const industryB = data[j].industry;
                const sdgsA = industrySdgsMap.get(industryA)!;
                const sdgsB = industrySdgsMap.get(industryB)!;

                const sharedSdgs = [ ...sdgsA ].filter((sdg) => sdgsB.has(sdg));
                if (sharedSdgs.length) {
                    sharedSdgs.forEach((sdg) => {
                        links.push({
                            source: industryA,
                            target: industryB,
                            link: sdg,
                            value: sharedSdgs.length,
                        });
                        this.incrementLinkCount(industryA);
                        this.incrementLinkCount(industryB);
                    });
                }
            }
        }
        return links;
    }

    private incrementLinkCount(eventKey: string) {
        const current = this.linkCounts.get(eventKey) || 0;
        this.linkCounts.set(eventKey, current + 1);
    }
}
