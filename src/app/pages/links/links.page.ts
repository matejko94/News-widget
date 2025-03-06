import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { combineLatest, map, Observable } from 'rxjs';
import { getSDGColor, SDG_COLORS } from '../../../../configuration/colors/policy/sdg.colors';
import { loadingMap } from '../../common/utility/loading-map';
import { EducationService } from '../../domain/education/service/education.service';
import { EventSdgsDto } from '../../domain/education/types/event-sdgs.dto';
import { ForceData, ForceDirectedChartComponent, ForceLink, ForceNode } from '../../ui/charts/force-directed-chart/force-directed-chart.component';
import { MenuComponent } from '../../ui/components/menu/menu.component';
import { BasePage } from '../base.page';

@Component({
    selector: 'links-page',
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
            <app-force-directed-chart [data]="data" tagLabel="SDG" [legend]="legend" class="w-full flex-1 min-h-0"/>
        }
    `,
})
export default class LinksPage extends BasePage implements OnInit {
    private educationService = inject(EducationService);

    public data$!: Observable<ForceData | undefined>;
    private linkCounts = new Map<string, number>();
    public legend = SDG_COLORS.colors.map((color, index) => ({ label: `SDG ${ index + 1 }`, color }));

    public override ngOnInit() {
        super.ngOnInit();

        this.data$ = combineLatest([
            toObservable(this.sdg, { injector: this.injector }),
            toObservable(this.topic, { injector: this.injector }),
        ]).pipe(
            loadingMap(([ sdg, topic ]) => this.educationService.getEventSdgs(+sdg, topic, 100)),
            map(data => data && this.mapData(data))
        );
    }

    private mapData(data: EventSdgsDto[]): ForceData {
        this.linkCounts.clear();

        const links = this.mapLinks(data);
        const nodes = this.mapNodes(data);

        return { nodes, links };
    }

    private mapNodes(data: EventSdgsDto[]): ForceNode[] {
        return data.map((evt) => ({
            id: evt.event,
            group: evt.main_sdg,
            tag: evt.main_sdg,
            totalLinks: this.linkCounts.get(evt.event) ?? 0,
            color: getSDGColor(evt.main_sdg),
        }));
    }

    private mapLinks(data: EventSdgsDto[]): ForceLink[] {
        const eventSdgsMap = new Map<string, Set<string>>();
        data.forEach((evt) => eventSdgsMap.set(evt.event, new Set(evt.sdgs)));

        const links: ForceLink[] = [];
        for (let i = 0; i < data.length; i++) {
            for (let j = i + 1; j < data.length; j++) {
                const eventA = data[i].event;
                const eventB = data[j].event;
                const sdgsA = eventSdgsMap.get(eventA)!;
                const sdgsB = eventSdgsMap.get(eventB)!;

                const sharedSdgs = [ ...sdgsA ].filter((sdg) => sdgsB.has(sdg));
                if (sharedSdgs.length) {
                    sharedSdgs.forEach((sdg) => {
                        links.push({
                            source: eventA,
                            target: eventB,
                            link: sdg,
                            value: 1,
                        });
                        this.incrementLinkCount(eventA);
                        this.incrementLinkCount(eventB);
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
