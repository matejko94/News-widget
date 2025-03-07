import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { combineLatest, map, Observable } from 'rxjs';
import { SDG_COLORS } from '../../../../configuration/colors/policy/sdg.colors';
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
    public legend = SDG_COLORS.colors.map((color, index) => ({ label: `SDG ${ index + 1 }`, color }));

    public override ngOnInit() {
        super.ngOnInit();

        this.data$ = combineLatest([
            toObservable(this.sdg, { injector: this.injector }),
            toObservable(this.topic, { injector: this.injector }),
        ]).pipe(
            loadingMap(([ sdg, topic ]) => this.educationService.getEventSdgs(+sdg, topic)),
            map(data => data && this.mapData(data))
        );
    }

    private mapData(data: EventSdgsDto): ForceData {
        const links = this.mapLinks(data);
        const nodes = this.mapNodes(data);

        return { nodes, links };
    }

    private mapNodes({ events }: EventSdgsDto): ForceNode[] {
        return events.map((evt) => ({
            id: evt.id,
            group: '',
            tag: evt.title,
            totalLinks: 0,
            color: '',
        }));
    }

    private mapLinks({ similarities }: EventSdgsDto): ForceLink[] {
        return similarities.map(link => ({
            source: link.source,
            target: link.target,
            link: '',
            value: link.similarity,
        }));
    }
}
