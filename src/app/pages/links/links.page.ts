import { AsyncPipe } from '@angular/common';
import { Component, computed, inject, OnInit } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { combineLatest, map, Observable } from 'rxjs';
import { getSDGColor } from '../../../../configuration/colors/policy/sdg.colors';
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

        [hidden] {
            display: none;
        }
    `,
    template: `
        <div class="flex justify-end items-center w-full mt-3 mb-5 pr-4">
            <app-menu queryParam="topic" label="Topic" [options]="topicOptions()" showClear/>
        </div>
        @if (data$ | async; as data) {
            @if (data.nodes.length) {
                <app-force-directed-chart [data]="data" tagLabel="SDG" [fixedColor]="color()"
                                          class="w-full flex-1 min-h-0"/>
            } @else {
                <div class="flex items-center justify-center w-full h-full text-2xl text-gray-400">
                    No data available
                </div>
            }
        }
    `,
})
export default class LinksPage extends BasePage implements OnInit {
    private educationService = inject(EducationService);

    public data$!: Observable<ForceData | undefined>;
    public color = computed(() => getSDGColor(this.sdg()));

    public override ngOnInit() {
        super.ngOnInit();

        this.data$ = combineLatest([
            toObservable(this.sdg, { injector: this.injector }),
            toObservable(this.topic, { injector: this.injector }),
        ]).pipe(
            loadingMap(([ sdg, topic ]) => this.educationService.getEventSdgs(sdg? +sdg : undefined, topic)),
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
            id: evt.title,
            group: '',
            tag: '',
            totalLinks: 0,
            color: '',
        }));
    }

    private mapLinks({ similarities, events }: EventSdgsDto): ForceLink[] {
        const eventNames = new Map<number, string>(events.map((evt) => [ evt.id, evt.title ]));

        return similarities
            .filter(({ source, target }) => eventNames.has(source) && eventNames.has(target))
            .map(link => ({
                source: eventNames.get(link.source)!,
                target: eventNames.get(link.target)!,
                link: '',
                value: link.similarity,
            }));
    }
}
