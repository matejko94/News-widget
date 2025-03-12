import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { combineLatest, map, Observable } from 'rxjs';
import { getRegionColor } from '../../../../configuration/regions/world-regions';
import { loadingMap } from '../../common/utility/loading-map';
import { InnovationsService } from '../../domain/innovations/service/innovations.service';
import { IndustryCollaborationResponseDto } from '../../domain/innovations/types/industry-collaboration-response.dto';
import { IndustryEdgeDto } from '../../domain/innovations/types/industry-edge.dto';
import { IndustryNodeDto } from '../../domain/innovations/types/industry-node.dto';
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
        @if (data$ | async; as data) {
            <app-force-directed-chart [data]="data" tagLabel="Country" class="w-full flex-1 min-h-0"/>
        }
    `,
})
export default class CollaborationPage extends BasePage implements OnInit {
    private innovationsService = inject(InnovationsService);
    public data$!: Observable<ForceData | undefined>;

    public override ngOnInit() {
        super.ngOnInit();

        this.data$ = combineLatest([
            toObservable(this.sdg, { injector: this.injector }),
        ]).pipe(
            loadingMap(([ sdg ]) => this.innovationsService.getIndustryCollaborations(+sdg, undefined)),
            map(data => data ? this.mapData(data) : undefined),
        );
    }

    private mapData(response: IndustryCollaborationResponseDto): ForceData {
        const linkCounts = new Map<string, number>();
        const links = this.mapLinks(
            response.edges.filter(({
                                       source,
                                       target,
                                       shared_sdgs
                                   }) => !source.includes('Other') && !target.includes('Other') && shared_sdgs > 2),
            linkCounts
        );
        const nodes = this.mapNodes(response.nodes, linkCounts);

        console.log({ linkCounts, nodes, links });

        return { nodes, links };
    }

    private mapNodes(data: IndustryNodeDto[], linkCounts: Map<string, number>): ForceNode[] {
        return data.map(node => ({
            id: node.industry,
            group: node.region,
            tag: node.industry,
            totalLinks: linkCounts.get(node.industry) ?? 0,
            color: getRegionColor(node.region),
        }));
    }

    private mapLinks(data: IndustryEdgeDto[], linkCounts: Map<string, number>): ForceLink[] {
        return data.map(edge => {
            this.incrementLinkCount(edge.source.split('_')[0], linkCounts);
            this.incrementLinkCount(edge.target.split('_')[0], linkCounts);

            return {
                source: edge.source.split('_')[0],
                target: edge.target.split('_')[0],
                link: edge.shared_sdgs.toString(),
                value: edge.shared_sdgs,
            };
        });
    }

    private incrementLinkCount(nodeId: string, linkCounts: Map<string, number>) {
        linkCounts.set(nodeId, (linkCounts.get(nodeId) || 0) + 1);
    }
}
