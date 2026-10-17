import { AsyncPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { combineLatest, map, Observable, tap } from 'rxjs';
import { getSDGColor } from '../../../../configuration/colors/policy/sdg.colors';
import { loadingMap } from '../../common/utility/loading-map';
import { EducationService } from '../../domain/education/service/education.service';
import { EventDto, EventSdgsDto } from '../../domain/education/types/event-sdgs.dto';
import { ForceData, ForceDirectedChartComponent, ForceLink, ForceNode } from '../../ui/charts/force-directed-chart/force-directed-chart.component';
import { MenuComponent } from '../../ui/components/menu/menu.component';
import { BasePage } from '../base.page';
import { LinksEventDetailsComponent } from './links-event-details.component';

@Component({
    selector: 'links-page',
    standalone: true,
    imports: [
        MenuComponent,
        ForceDirectedChartComponent,
        AsyncPipe,
        LinksEventDetailsComponent,
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

        [hidden] {
            display: none;
        }

        /* Overlays the graph rather than resizing it, so clicking a node doesn't restart the
           simulation. Full-width sheet on narrow screens, side panel from md up — as on the radial. */
        .event-panel {
            position: absolute;
            z-index: 30;
            inset: auto 0 0 0;
            max-height: 60%;
            border-top: 1px solid #e5e7eb;
            box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.08);
        }

        @media (min-width: 768px) {
            .event-panel {
                inset: 0 0 0 auto;
                width: 22rem;
                max-height: none;
                border-top: none;
                border-left: 1px solid #e5e7eb;
                box-shadow: -4px 0 12px rgba(0, 0, 0, 0.08);
            }
        }
    `,
    template: `
        <div class="flex justify-end items-center w-full mt-3 mb-5 pr-4">
            <app-menu queryParam="topic" label="Topic" [options]="topicOptions()" showClear/>
        </div>
        @if (data$ | async; as data) {
            @if (data.nodes.length) {
                <app-force-directed-chart [data]="data" tagLabel="SDG" [fixedColor]="color()"
                                          [selected]="selectedId()"
                                          (nodeSelect)="selectedId.set($any($event))"
                                          class="w-full flex-1 min-h-0"/>

                @if (selectedEvent(); as event) {
                    <app-links-event-details class="event-panel"
                                             [event]="event"
                                             [connections]="connectionsOf(event.id)"
                                             [color]="color()"
                                             (close)="selectedId.set(null)"/>
                }
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
    // The clicked event (node id), or null when no panel is open.
    public selectedId = signal<number | null>(null);
    private events = signal<Map<number, EventDto>>(new Map());
    private connections = new Map<number, number>();
    public selectedEvent = computed(() => {
        const id = this.selectedId();
        return id === null ? null : this.events().get(id) ?? null;
    });

    public override ngOnInit() {
        super.ngOnInit();

        this.data$ = combineLatest([
            toObservable(this.sdg, { injector: this.injector }),
            toObservable(this.pilot, { injector: this.injector }),
            toObservable(this.topic, { injector: this.injector }),
        ]).pipe(
            loadingMap(([ sdg, pilot, topic ]) => {
                // Use pilot event sdgs if pilot is available, otherwise fall back to sdg event sdgs
                if (pilot && pilot !== null) {
                    return this.educationService.getPilotEvent(pilot, topic);
                } else {
                    return this.educationService.getEventSdgs(sdg? +sdg : undefined, topic);
                }
            }),
            // New data rebuilds the graph, so the open event may no longer be in it.
            tap(data => this.indexEvents(data)),
            map(data => data && this.mapData(data))
        );
    }

    public connectionsOf(id: number): number {
        return this.connections.get(id) ?? 0;
    }

    private indexEvents(data: EventSdgsDto | undefined) {
        const events = new Map((data?.events ?? []).map(evt => [ evt.id, evt ]));
        this.connections = new Map();

        for (const { source, target } of data?.similarities ?? []) {
            if (events.has(source) && events.has(target)) {
                this.connections.set(source, (this.connections.get(source) ?? 0) + 1);
                this.connections.set(target, (this.connections.get(target) ?? 0) + 1);
            }
        }

        this.events.set(events);
        this.selectedId.set(null);
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

    private mapLinks({ similarities, events }: EventSdgsDto): ForceLink[] {
        const eventIds = new Set(events.map(evt => evt.id));

        return similarities
            .filter(({ source, target }) => eventIds.has(source) && eventIds.has(target))
            .map(link => ({
                source: link.source,
                target: link.target,
                link: '',
                value: link.similarity,
            }));
    }
}
