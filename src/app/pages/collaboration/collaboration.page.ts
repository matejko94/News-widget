import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { combineLatest, combineLatestWith, map, Observable } from 'rxjs';
import { getRegionColor } from '../../../../configuration/regions/world-regions';
import { loadingMap } from '../../common/utility/loading-map';
import { InnovationsService } from '../../domain/innovations/service/innovations.service';
import { IndustryCollaborationResponseDto } from '../../domain/innovations/types/industry-collaboration-response.dto';
import { IndustryEdgeDto } from '../../domain/innovations/types/industry-edge.dto';
import { IndustryNodeDto } from '../../domain/innovations/types/industry-node.dto';
import { ForceData, ForceDirectedChartComponent, ForceLink, ForceNode } from '../../ui/charts/force-directed-chart/force-directed-chart.component';
import { MenuComponent } from '../../ui/components/menu/menu.component';
import { SpinnerComponent } from '../../ui/components/spinner/spinner.component';
import { BasePage } from '../base.page';

@Component({
    selector: 'collaboration-page',
    standalone: true,
    imports: [
        ForceDirectedChartComponent,
        AsyncPipe,
        MenuComponent,
        SpinnerComponent,
    ],
    styles: `
        :host {
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
            height: 100%;
        }
    `,
    template: `
        <app-menu queryParam="region" label="Select region" [options]="worldRegionOptions"
                  showClear class="absolute top-5 right-5 z-10"/>

        @if (data$ | async; as data) {
            @if (data.links.length && data.nodes.length) {
                <app-force-directed-chart
                    class="w-full flex-1 min-h-0" [data]="data"
                    tagLabel="Country" [legend]="worldRegionOptions"
                />
            } @else {
                <div class="flex items-center justify-center w-full h-full text-2xl text-gray-400">
                    No data available
                </div>
            }
        } @else {
            <app-spinner/>
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
            loadingMap(([ sdg ]) => this.innovationsService.getIndustryCollaborations(sdg ? +sdg : undefined, undefined)),
            combineLatestWith(this.selectedRegion$),
            map(([ data, region ]) => data ? this.mapData(data, region) : undefined),
        );
    }

    private mapData(response: IndustryCollaborationResponseDto, region: string | undefined): ForceData {
        const linkCounts = new Map<string, number>();
        const links = this.mapLinks(response.edges, linkCounts, region);
        const nodes = this.mapNodes(response.nodes, linkCounts, region);

        return { nodes, links };
    }

    private mapNodes(data: IndustryNodeDto[], linkCounts: Map<string, number>, region: string | undefined): ForceNode[] {
        return data
            .filter(node => !region || node.region === region)
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
            .filter(node => node.totalLinks > 0);
    }

    private mapLinks(data: IndustryEdgeDto[], linkCounts: Map<string, number>, region: string | undefined): ForceLink[] {
        return data
            .filter(({ source, target, shared_sdgs }) => {
                if (source.includes('Other') || target.includes('Other')) {
                    return false;
                }

                if (shared_sdgs <= this.minShared) {
                    return false;
                }

                if (region) {
                    return source.includes(region) && target.includes(region);
                }

                return true;
            })
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
