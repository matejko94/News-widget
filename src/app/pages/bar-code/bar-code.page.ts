import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { combineLatest, map, Observable } from 'rxjs';
import { loadingMap } from '../../common/utility/loading-map';
import { sortBySdg } from '../../common/utility/sort-by-sdg';
import { PolicyService } from '../../domain/policy/service/policy.service';
import { BarcodeChartComponent } from '../../ui/charts/bar-code/bar-code-chart.component';
import { MenuComponent } from '../../ui/components/menu/menu.component';
import { SpinnerComponent } from '../../ui/components/spinner/spinner.component';
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
        MenuComponent,
        SpinnerComponent,
    ],
    styles: `
        :host {
            position: relative;
            display: flex;
            flex-direction: column;
            justify-items: center;
            align-items: center;
            width: 100%;
            height: 100%;
        }
    `,
    template: `
        <app-menu queryParam="region" label="Select region" [options]="worldRegionOptions" showClear
                  class="ml-auto mb-5 mt-10 mr-4"/>

        @if (data$ | async; as data) {
            @if (data.length) {
                <app-barcode-chart [data]="data"/>
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
export default class BarCodePage extends BasePage implements OnInit {
    private policyService = inject(PolicyService);

    public data$!: Observable<Data[] | undefined>;

    public override ngOnInit() {
        super.ngOnInit();

        this.data$ = combineLatest([
            toObservable(this.sdg, { injector: this.injector }),
            toObservable(this.region, { injector: this.injector })
        ]).pipe(
            loadingMap(([ sdg, region ]) => this.policyService.getIntersectingSdgPolicies(+sdg, region, 20)),
            map(intersection => intersection
                ?.sort((a, b) => sortBySdg(a.sdg, b.sdg))
                .flatMap(({ sdg, sdg_intersections }) => sdg_intersections.map(({ key, value }) => ({
                    sdg: sdg,
                    policy: key,
                    count: value
                }))))
        );
    }
}
