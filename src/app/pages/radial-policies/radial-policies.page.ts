import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { map, Observable } from 'rxjs';
import { SDG_COLORS } from '../../../../configuration/colors/policy/sdg.colors';
import { PolicyService } from '../../domain/policy/service/policy.service';
import { IntersectingPolicyDto } from '../../domain/policy/types/intersecting-policy.dto';
import { RadialStackedChartComponent, RadialStackedData } from '../../ui/charts/radial-stacked-chart/radial-stacked-chart.component';
import { BasePage } from '../base.page';

@Component({
    selector: 'radial-policy-page',
    standalone: true,
    imports: [
        RadialStackedChartComponent,
        AsyncPipe
    ],
    styles: `
        :host {
            display: flex;
            justify-items: center;
            align-items: center;
            width: 100%;
            height: 100%;
        }
    `,
    template: `
        @if (sdgPolicies$ | async; as data) {
            <app-radial-stacked-chart [data]="data" [colors]="colors"/>
        }
    `
})
export default class RadialPolicyPage extends BasePage implements OnInit {
    private policyService = inject(PolicyService);

    public sdgPolicies$!: Observable<RadialStackedData[]>
    public colors = SDG_COLORS.colors;

    public override ngOnInit() {
        super.ngOnInit();

        this.sdgPolicies$ = this.policyService.getIntersectingSdgPolicies(+this.sdg(), 20)
            .pipe(
                map(policies => this.groupBySdg(policies, 10))
            );
    }

    private groupBySdg(policies: IntersectingPolicyDto[], limit: number): RadialStackedData[] {
        const topicSdgMap = new Map<string, RadialStackedData>();

        policies
            .flatMap(({ topic: sdg, sdg_intersections }) => sdg_intersections.map(({ key: topic, value }) => ({
                topic,
                sdg,
                value
            })))
            .forEach(({ topic, sdg, value }) => {
                if (!topicSdgMap.has(topic)) {
                    topicSdgMap.set(topic, {
                        groupLabel: topic,
                        items: {}
                    });
                }

                const topicSdg = topicSdgMap.get(topic);

                if (topicSdg) {
                    topicSdg.items[sdg] = value;
                }
            });

        return Array.from(topicSdgMap.values())
            .sort((a, b) => Object.values(b.items).reduce((acc, value) => acc + value, 0) - Object.values(a.items).reduce((acc, value) => acc + value, 0))
            .slice(0, limit);
    }
}
