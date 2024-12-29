import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { map, Observable } from 'rxjs';
import { POLICY_SDG_COLORS } from '../../../../configuration/colors/policy/sdg.colors';
import { PolicyService } from '../../domain/policy/service/policy.service';
import { PolicyAggregateDto } from '../../domain/policy/types/policy-aggregate.dto';
import {
    RadialStackedChartComponent,
    RadialStackedData
} from "../../ui/charts/radial-stacked-chart/radial-stacked-chart.component";
import { LegendComponent } from '../../ui/legend/legend.component';
import { BasePage } from '../base.page';

@Component({
    selector: 'radial-policy-page',
    standalone: true,
    imports: [
        RadialStackedChartComponent,
        AsyncPipe,
        LegendComponent
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
    public colors = POLICY_SDG_COLORS.colors;

    public override ngOnInit() {
        super.ngOnInit();

        this.sdgPolicies$ = this.policyService.getPolicies(this.availableTopics().map(topic => topic.name))
            .pipe(
              map(policies => this.groupBySdg(policies))
            );
    }

    private groupBySdg(policies: PolicyAggregateDto[]): RadialStackedData[] {
        const sdgPolicyMap = new Map<number, RadialStackedData>();

        for(const policy of policies) {
            const sdg = policy.sdg;

            if(!sdgPolicyMap.has(sdg)) {
                sdgPolicyMap.set(sdg, {
                    groupLabel: `${sdg}`,
                    items: {}
                });
            }

            const sdgPolicy = sdgPolicyMap.get(sdg);

            if(sdgPolicy) {
                sdgPolicy.items[policy.name] = policy.count;
            }
        }

        return Array.from(sdgPolicyMap.values());
    }
}
