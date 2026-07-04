import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { combineLatest, map, Observable } from 'rxjs';
import { getSDGColor, SDG_COLORS } from '../../../../configuration/colors/policy/sdg.colors';
import { loadingMap } from '../../common/utility/loading-map';
import { PolicyService } from '../../domain/policy/service/policy.service';
import { IntersectingPolicyDto } from '../../domain/policy/types/intersecting-policy.dto';
import { RadialStackedChartComponent, RadialStackedData } from '../../ui/charts/radial-stacked-chart/radial-stacked-chart.component';
import { SpinnerComponent } from '../../ui/components/spinner/spinner.component';
import { BasePage } from '../base.page';

@Component({
    selector: 'radial-policy-page',
    standalone: true,
    imports: [
        RadialStackedChartComponent,
        AsyncPipe,
        SpinnerComponent
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
    `,
    template: `
        @if (topics$ | async; as data) {
            @if (data.length) {
                <app-radial-stacked-chart [data]="data" [colors]="colors" [colorMap]="colorMap"/>
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
    // Human-readable names shown for the OER policies (pilot view segments).
    private static readonly OER_LABELS: Record<string, string> = {
        OER1: 'Capacity Building',
        OER2: 'Supportive Policy',
        OER3: 'Inclusive Access',
        OER4: 'Sustainable Models',
        OER5: 'International Cooperation',
    };
    private static readonly OER_COLORS: Record<string, string> = {
        OER1: '#4C9F38',
        OER2: '#FCC30B',
        OER3: '#C5192D',
        OER4: '#26BDE2',
        OER5: '#A21942',
    };

    private policyService = inject(PolicyService);

    public topics$!: Observable<RadialStackedData[] | null>;
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
            loadingMap(([sdgValue, pilotValue]) => {
                if (pilotValue) {
                    return this.policyService.getEducationPilotTopics(pilotValue);
                }
                return this.policyService.getEducationSdgTopics(sdgValue ? +sdgValue : undefined);
            }),
            map(dtos => dtos ? this.toRadial(dtos) : null)
        );
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
                    ? (RadialPolicyPage.OER_COLORS[key] ?? '#6B7280')
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
