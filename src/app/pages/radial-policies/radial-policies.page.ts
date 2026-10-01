import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { combineLatest, map, Observable, Subscription, tap } from 'rxjs';
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
import { SegmentDocumentDto } from '../../domain/education/types/segment-document.dto';
import { RadialSegmentDetailsComponent } from './radial-segment-details.component';

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
                    <app-radial-segment-details class="segment-panel"
                                                [segment]="segment"
                                                [documents]="documents()"
                                                [total]="documentsTotal()"
                                                [hasMore]="hasMoreDocuments()"
                                                [loading]="loadingDocuments()"
                                                [excluded]="documentsExcluded()"
                                                [color]="colorOf(segment.label)"
                                                (close)="selectSegment(null)"
                                                (loadMore)="loadMoreDocuments()"/>
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
    // The lectures behind the open segment, accumulated page by page as the panel is scrolled.
    public documents = signal<SegmentDocumentDto[]>([]);
    public documentsTotal = signal(0);
    public documentsExcluded = signal(0);
    public hasMoreDocuments = signal(false);
    public loadingDocuments = signal(false);
    private documentsPage = 0;
    private documentsRequest?: Subscription;
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
    }

    /** Segment colour for the panel header; falls back to grey for unmapped keys. */
    public colorOf(label: string): string {
        return this.colorMap[label] || RadialPolicyPage.FALLBACK_COLOR;
    }

    public selectSegment(segment: RadialSegmentSelection | null) {
        this.selectedSegment.set(segment);
        this.resetDocuments();

        if (segment) {
            this.loadMoreDocuments();
        }
    }

    /**
     * Fetch the next page of lectures for the open segment and append it. The sentinel at the
     * bottom of the panel can fire repeatedly, so ignore a request while one is in flight or
     * once the backend says there is nothing after this page.
     */
    public loadMoreDocuments() {
        const segment = this.selectedSegment();

        if (!segment || this.loadingDocuments() || (this.documentsPage > 0 && !this.hasMoreDocuments())) {
            return;
        }

        const page = this.documentsPage + 1;
        this.loadingDocuments.set(true);

        this.documentsRequest = this.educationService
            .getSegmentDocuments(segment.groupLabel, this.keyOf(segment), this.pilot(), page)
            .subscribe(response => {
                this.loadingDocuments.set(false);

                if (!response) {
                    return;
                }

                this.documentsPage = page;
                this.documents.update(documents => [ ...documents, ...response.documents ]);
                this.documentsTotal.set(response.total);
                this.documentsExcluded.set(response.excluded_count ?? 0);
                this.hasMoreDocuments.set(response.has_more);
            });
    }

    // Close the panel whenever the underlying data changes — the open segment may no longer exist.
    private clearSelection() {
        this.selectedSegment.set(null);
        this.resetDocuments();
    }

    private resetDocuments() {
        this.documentsRequest?.unsubscribe();
        this.documentsPage = 0;
        this.documents.set([]);
        this.documentsTotal.set(0);
        this.documentsExcluded.set(0);
        this.hasMoreDocuments.set(false);
        this.loadingDocuments.set(false);
    }

    /**
     * The key the documents endpoint expects for the clicked segment: the SDG label as shown
     * ("SDG 4"), or — in the pilot view, where the stack keys are the human-readable action-area
     * names — the OER1..OER5 code behind the name.
     */
    private keyOf(segment: RadialSegmentSelection): string {
        return this.actionAreaOf(segment.label) ?? segment.label;
    }

    /** Human-readable action-area name back to its OER1..OER5 code. Pilot view only. */
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
