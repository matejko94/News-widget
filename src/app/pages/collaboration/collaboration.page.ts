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
import { BasePage } from '../base.page';

@Component({
    selector: 'collaboration-page',
    standalone: true,
    imports: [
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
    private minShared = 4;

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
        const links = this.mapLinks(response.edges, linkCounts);
        const nodes = this.mapNodes(response.nodes, linkCounts);

        return { nodes, links };
    }

    private mapNodes(data: IndustryNodeDto[], linkCounts: Map<string, number>): ForceNode[] {
        return data
            .map(node => {
                const id = node.industry + ' | ' + node.region;

                return {
                    id: id,
                    group: node.region,
                    tag: node.industry,
                    totalLinks: linkCounts.get(id.toLowerCase()) ?? 0,
                    color: getRegionColor(node.region),
                }
            })
            .filter(node => {
                const okay = node.totalLinks > 0;

                if (!okay) {
                    console.warn(`Node ${ node.tag } has no links`);
                } else {
                    console.log(`Node ${ node.tag } has ${ node.totalLinks } links`);
                }

                return okay;
            });
    }

    private mapLinks(data: IndustryEdgeDto[], linkCounts: Map<string, number>): ForceLink[] {
        return data
            .filter(({ source, target, shared_sdgs }) =>
                !source.includes('Other') &&
                !target.includes('Other') &&
                shared_sdgs > this.minShared
            )
            .map(edge => {
                const [ sourceName, sourceRegion ] = edge.source.split('_');
                const [ targetName, targetRegion ] = edge.target.split('_');
                const source = `${ sourceName } | ${ sourceRegion }`;
                const target = `${ targetName } | ${ targetRegion }`;

                this.incrementLinkCount(source.toLowerCase(), linkCounts);
                this.incrementLinkCount(target.toLowerCase(), linkCounts);

                return {
                    source: source,
                    target: target,
                    link: edge.shared_sdgs.toString(),
                    value: edge.shared_sdgs,
                };
            });
    }

    private incrementLinkCount(nodeId: string, linkCounts: Map<string, number>) {
        linkCounts.set(nodeId, (linkCounts.get(nodeId) || 0) + 1);
    }
}
