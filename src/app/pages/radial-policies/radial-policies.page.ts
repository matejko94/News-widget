import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { combineLatest, map, Observable, of, tap } from 'rxjs';
import { getSDGColor, SDG_COLORS } from '../../../../configuration/colors/policy/sdg.colors';
import { OER_ACTION_AREA_NAMES, OerActionArea } from '../../../../configuration/pilot/oer-action-areas';
import { loadingMap } from '../../common/utility/loading-map';
import { EducationService } from '../../domain/education/service/education.service';
import { PolicyService } from '../../domain/policy/service/policy.service';
import { IntersectingPolicyDto } from '../../domain/policy/types/intersecting-policy.dto';
import {
    RadialSegmentSelection,
    RadialStackedChartComponent,
    RadialStackedData
} from '../../ui/charts/radial-stacked-chart/radial-stacked-chart.component';
import { SpinnerComponent } from '../../ui/components/spinner/spinner.component';
import { BasePage } from '../base.page';
import { RadialSegmentDetailsComponent, SegmentEvent } from './radial-segment-details.component';

@Component({
    selector: 'radial-policy-page',
    standalone: true,
    imports: [
        RadialStackedChartComponent,
        AsyncPipe,
        SpinnerComponent,
        RadialSegmentDetailsComponent
    ],
    styles: `
        :host {
            position: relative;
            display: flex;
            justify-items: center;
            align-items: center;
            width: 100%;
            height: 100%;
        }

        /* Overlays the chart rather than resizing it, so clicking a segment doesn't reflow the
           radial underneath. Full-width sheet on narrow screens, side panel from md up. */
        .segment-panel {
            position: absolute;
            z-index: 30;
            inset: auto 0 0 0;
            max-height: 72%;
            border-top: 1px solid #e5e7eb;
            box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.08);
        }

        @media (min-width: 768px) {
            .segment-panel {
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
        @if (topics$ | async; as data) {
            @if (data.length) {
                <app-radial-stacked-chart [data]="data" [colors]="colors" [colorMap]="colorMap"
                                          [selected]="selectedSegment()"
                                          (segmentSelect)="selectSegment($event)"/>

                @if (selectedSegment(); as segment) {
                    @let events = segmentEvents$ | async;

                    <app-radial-segment-details class="segment-panel"
                                                [segment]="segment"
                                                [events]="events ?? []"
                                                [loading]="!events"
                                                [color]="colorOf(segment.label)"
                                                (close)="selectSegment(null)"/>
                }
            } @else {
                <div class="flex items-center justify-center w-full h-full text-2xl text-gray-400">
                    No data available
                </div>
            }
        } @else {
            <app-spinner/>
        }
    `
})
export default class RadialPolicyPage extends BasePage implements OnInit {
    // Human-readable names shown for the OER policies (pilot view segments). Shared with the news
    // widget, which shows the same names as tooltips on its action-area labels.
    private static readonly OER_LABELS: Record<string, string> = OER_ACTION_AREA_NAMES;
    private static readonly FALLBACK_COLOR = '#6B7280';
    private static readonly OER_COLORS: Record<string, string> = {
        OER1: '#4C9F38',
        OER2: '#FCC30B',
        OER3: '#C5192D',
        OER4: '#26BDE2',
        OER5: '#A21942',
    };

    private policyService = inject(PolicyService);
    private educationService = inject(EducationService);

    public topics$!: Observable<RadialStackedData[] | null>;
    // The clicked stack segment (topic x SDG/OER), or null when nothing is open.
    public selectedSegment = signal<RadialSegmentSelection | null>(null);
    // Events behind the open segment; undefined while loading (see `loadingMap`).
    public segmentEvents$!: Observable<SegmentEvent[] | undefined>;
    // Fallback palette for the chart; per-key colors come from `colorMap`.
    public colors = SDG_COLORS.colors;
    // Per-segment color: official SDG color (SDG view) or OER policy color (pilot view).
    public colorMap: Record<string, string> = {};

    public override ngOnInit() {
        super.ngOnInit();

        // One bar per topic (up to 20), stacked by SDG or OER policy, sourced from
        // the education index. Re-fetch whenever the SDG or pilot selection changes.
        this.topics$ = combineLatest([
            toObservable(this.sdg, { injector: this.injector }),
            toObservable(this.pilot, { injector: this.injector })
        ]).pipe(
            // A new SDG / pilot rebuilds the bars, so the open segment may no longer exist.
            tap(() => this.clearSelection()),
            loadingMap(([sdgValue, pilotValue]) => {
                if (pilotValue) {
                    return this.policyService.getEducationPilotTopics(pilotValue);
                }
                return this.policyService.getEducationSdgTopics(sdgValue ? +sdgValue : undefined);
            }),
            map(dtos => dtos ? this.toRadial(dtos) : null)
        );

        // Which events the clicked segment's material comes from. /education/whitespace is the
        // only endpoint that reaches behind the aggregation today; it returns a sample of events
        // rather than the counted lectures, and the panel says so.
        this.segmentEvents$ = toObservable(this.selectedSegment, { injector: this.injector }).pipe(
            loadingMap(segment => {
                if (!segment) {
                    return of([]);
                }

                const actionArea = this.actionAreaOf(segment.label);

                return (actionArea
                    ? this.educationService.getPilotEvent(actionArea, segment.groupLabel)
                    : this.educationService.getEventSdgs(this.sdgNumberOf(segment.label), segment.groupLabel)
                ).pipe(
                    // The endpoint pads its response with empty {id: null, title: null} entries.
                    map(({ events }) => events.filter(event => event?.id != null && !!event.title))
                );
            })
        );
    }

    /** Segment colour for the panel header; falls back to grey for unmapped keys. */
    public colorOf(label: string): string {
        return this.colorMap[label] || RadialPolicyPage.FALLBACK_COLOR;
    }

    public selectSegment(segment: RadialSegmentSelection | null) {
        this.selectedSegment.set(segment);
    }

    // Close the panel whenever the underlying data changes — the open segment may no longer exist.
    private clearSelection() {
        this.selectedSegment.set(null);
    }

    /** `"SDG 4"` -> 4. Undefined for anything else, which leaves the request unfiltered by SDG. */
    private sdgNumberOf(label: string): number | undefined {
        const match = /(\d+)/.exec(label);
        return match ? +match[1] : undefined;
    }

    /**
     * In the pilot view the stack keys are the human-readable action-area names, while
     * /education/whitespace/pilot expects the OER1..OER5 code. Map back.
     */
    private actionAreaOf(label: string): OerActionArea | undefined {
        if (!this.pilot()) {
            return undefined;
        }

        return (Object.keys(OER_ACTION_AREA_NAMES) as OerActionArea[])
            .find(area => OER_ACTION_AREA_NAMES[area] === label);
    }

    // Backend returns one entry per topic: { sdg: <topic>, sdg_intersections: [{key: SDG|pilot, value}] }.
    // Turn that into bars (groupLabel = topic) with one stacked segment per SDG / OER policy,
    // and build the matching color map.
    // Cap on the number of bars so the radial labels stay legible.
    private static readonly MAX_BARS = 14;

    private toRadial(dtos: IntersectingPolicyDto[]): RadialStackedData[] {
        const isPilot = !!this.pilot();
        const colorMap: Record<string, string> = {};

        const bars = dtos.map(dto => {
            const items: { [key: string]: number } = {};
            for (const { key, value } of dto.sdg_intersections) {
                const label = isPilot ? (RadialPolicyPage.OER_LABELS[key] ?? key) : key;
                items[label] = value;
                colorMap[label] = isPilot
                    ? (RadialPolicyPage.OER_COLORS[key] ?? RadialPolicyPage.FALLBACK_COLOR)
                    : getSDGColor(key);
            }
            const total = Object.values(items).reduce((a, b) => a + b, 0);
            return { groupLabel: dto.sdg, items, total };
        });

        // Drop the long tail of near-empty topics (they only crowd the labels)
        // and cap the number of bars — "allow fewer when there is not enough data".
        const maxTotal = Math.max(0, ...bars.map(b => b.total));
        const minTotal = Math.max(3, maxTotal * 0.05);
        const visible = bars
            .filter(b => b.total >= minTotal)
            .slice(0, RadialPolicyPage.MAX_BARS)
            .map(({ groupLabel, items }) => ({ groupLabel, items }));

        this.colorMap = colorMap;
        return visible;
    }
}
