import {Component} from "@angular/core";
import {
    RadialStackedChartComponent,
    RadialStackedData
} from "../../ui/charts/radial-stacked-chart/radial-stacked-chart.component";

export const TEST_DATA: RadialStackedData[] = [
    {
        groupLabel: "CA",
        items: {
            Under5: 2704659,
            "5to13": 4499890,
            "14to17": 2159981,
            "18to24": 3853788,
            "25to44": 10604510,
            "45to64": 8819342,
            "65andOver": 4114496
        }
    },
    {
        groupLabel: "TX",
        items: {
            Under5: 2027307,
            "5to13": 3277946,
            "14to17": 1420518,
            "18to24": 2454721,
            "25to44": 7017731,
            "45to64": 5656528,
            "65andOver": 2472223
        }
    },
    {
        groupLabel: "NY",
        items: {
            Under5: 1208495,
            "5to13": 2141490,
            "14to17": 1058031,
            "18to24": 1999120,
            "25to44": 5355235,
            "45to64": 5120254,
            "65andOver": 2607672
        }
    },
    {
        groupLabel: "FL",
        items: {
            Under5: 1140516,
            "5to13": 1938695,
            "14to17": 925060,
            "18to24": 1607297,
            "25to44": 4782119,
            "45to64": 4746856,
            "65andOver": 3187797
        }
    },
    {
        groupLabel: "IL",
        items: {
            Under5: 894368,
            "5to13": 1558919,
            "14to17": 725973,
            "18to24": 1311479,
            "25to44": 3596343,
            "45to64": 3239173,
            "65andOver": 1574421
        }
    },
    {
        groupLabel: "CA1",
        items: {
            Under5: 2704659,
            "5to13": 4499890,
            "14to17": 2159981,
            "18to24": 3853788,
            "25to44": 10604510,
            "45to64": 8819342,
            "65andOver": 4114496
        }
    },
    {
        groupLabel: "TX1",
        items: {
            Under5: 2027307,
            "5to13": 3277946,
            "14to17": 1420518,
            "18to24": 2454721,
            "25to44": 7017731,
            "45to64": 5656528,
            "65andOver": 2472223
        }
    },
    {
        groupLabel: "NY1",
        items: {
            Under5: 1208495,
            "5to13": 2141490,
            "14to17": 1058031,
            "18to24": 1999120,
            "25to44": 5355235,
            "45to64": 5120254,
            "65andOver": 2607672
        }
    },
    {
        groupLabel: "FL1",
        items: {
            Under5: 1140516,
            "5to13": 1938695,
            "14to17": 925060,
            "18to24": 1607297,
            "25to44": 4782119,
            "45to64": 4746856,
            "65andOver": 3187797
        }
    },
    {
        groupLabel: "IL1",
        items: {
            Under5: 894368,
            "5to13": 1558919,
            "14to17": 725973,
            "18to24": 1311479,
            "25to44": 3596343,
            "45to64": 3239173,
            "65andOver": 1574421
        }
    }
];

@Component({
    selector: 'radial-regions-page',
    standalone: true,
    imports: [
        RadialStackedChartComponent
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
        <app-radial-stacked-chart [data]="data"/>
    `
})
export default class SunburstPage {
    public data: RadialStackedData[] = TEST_DATA;
}