import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { map, Observable } from 'rxjs';
import { SDG_COLORS } from '../../../../configuration/colors/policy/sdg.colors';
import { loadingMap } from '../../common/utility/loading-map';
import { createSdgObject } from '../../common/utility/sdg-object';
import { PolicyService } from '../../domain/policy/service/policy.service';
import { IntersectingPolicyDto } from '../../domain/policy/types/intersecting-policy.dto';
import { RadialStackedChartComponent, RadialStackedData } from '../../ui/charts/radial-stacked-chart/radial-stacked-chart.component';
import { MenuComponent } from '../../ui/components/menu/menu.component';
import { SpinnerComponent } from '../../ui/components/spinner/spinner.component';
import { BasePage } from '../base.page';

@Component({
    selector: 'radial-policy-page',
    standalone: true,
    imports: [
        RadialStackedChartComponent,
        AsyncPipe,
        SpinnerComponent,
        MenuComponent
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
        <app-menu queryParam="region" label="Select region" [options]="worldRegionOptions"
                  showClear class="absolute top-5 right-5 z-10"/>

        @if (sdgPolicies$ | async; as data) {
            @if (data.length) {
                <app-radial-stacked-chart [data]="data" [colors]="colors"/>
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
    private policyService = inject(PolicyService);

    public sdgPolicies$!: Observable<RadialStackedData[] | null>
    public colors = SDG_COLORS.colors;

    public override ngOnInit() {
        super.ngOnInit();

        this.sdgPolicies$ = this.selectedRegion$
            .pipe(
                loadingMap(region => {
                    const sdgValue = this.sdg();
                    const pilotValue = this.pilot();
                    console.log(pilotValue, 'pilotValue');
                    console.log(sdgValue, 'sdgValue');
                    // Use pilot intersection if pilot is available, otherwise fall back to sdg intersection
                    if (pilotValue && pilotValue !== null) {
                        return this.policyService.getIntersectingPilotPolicies(pilotValue, region, 20);
                    } else {
                        return this.policyService.getIntersectingSdgPolicies(sdgValue ? +sdgValue : undefined, region, 20);
                    }
                }),
                map(policies => policies ? this.groupBySdg(policies, 10) : null)
            );
    }

    private groupBySdg(policies: IntersectingPolicyDto[], limit: number): RadialStackedData[] {
        const topicSdgMap = new Map<string, RadialStackedData>();

        policies
            .flatMap(({ sdg, sdg_intersections }) => sdg_intersections.map(({ key: topic, value }) => ({
                topic,
                sdg,
                value
            })))
            .forEach(({ topic, sdg, value }) => {
                if (!topicSdgMap.has(topic)) {
                    topicSdgMap.set(topic, {
                        groupLabel: topic,
                        items: createSdgObject(0)
                    });
                }

                const topicSdg = topicSdgMap.get(topic);

                if (topicSdg) {
                    topicSdg.items[sdg] = value;
                }
            });

        return Array.from(topicSdgMap.values()).slice(0, limit);
    }
}
