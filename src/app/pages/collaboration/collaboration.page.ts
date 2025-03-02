import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { combineLatest, map, Observable, tap } from 'rxjs';
import { getRegionColor } from '../../../../configuration/regions/world-regions';
import { loadingMap } from '../../common/utility/loading-map';
import { InnovationsService } from '../../domain/innovations/service/innovations.service';
import { IndustryLinkDto } from '../../domain/innovations/types/industr-link.dto';
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

    public override ngOnInit() {
        super.ngOnInit();

        this.data$ = combineLatest([
            toObservable(this.sdg, { injector: this.injector }),
            toObservable(this.topic, { injector: this.injector }),
        ]).pipe(
            loadingMap(([ sdg, topic ]) => this.innovationsService.getIndustryCollaborations(+sdg, topic)),
            map(data => data ? this.mapData(data) : undefined),
        );
    }

    private mapData(response: IndustryCollaborationResponseDto): ForceData {
        const linkCounts = new Map<string, number>();
        const links = this.mapLinks(response.edges.filter(edge => !edge.source.includes('Other') && !edge.target.includes('Other')), linkCounts);
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
