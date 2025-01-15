import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { map, Observable } from 'rxjs';
import { sortBySdg } from '../../common/utility/sort-by-sdg';
import { PolicyService } from '../../domain/policy/service/policy.service';
import { BarcodeChartComponent } from '../../ui/charts/bar-code/bar-code-chart.component';
import { BasePage } from '../base.page';

interface Data {
    sdg: string;
    policy: string;
    count: number;
}

@Component({
    selector: 'sunburst-policy',
    standalone: true,
    imports: [
        BarcodeChartComponent,
        AsyncPipe,
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
        @if (data$ | async; as data) {
            @if (data.length) {
                <app-barcode-chart [data]="data"/>
            } @else {
                <div class="flex items-center justify-center w-full h-full text-2xl text-gray-400">
                    No data available
                </div>
            }
        }
    `
})
export default class BarCodePage extends BasePage implements OnInit {
    private policyService = inject(PolicyService);

    public data$!: Observable<Data[]>;

    public override ngOnInit() {
        super.ngOnInit();

        this.data$ = this.policyService.getIntersectingSdgPolicies(+this.sdg(), 20).pipe(
            map(intersection => intersection
                .sort((a, b) => sortBySdg(a.sdg, b.sdg))
                .flatMap(({ sdg, sdg_intersections }) => sdg_intersections.map(({ key, value }) => ({
                    sdg: sdg,
                    policy: key,
                    count: value
                }))))
        );
    }
}
