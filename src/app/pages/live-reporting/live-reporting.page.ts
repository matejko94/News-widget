import {AfterViewInit, Component, ElementRef, input, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Chart, registerables} from 'chart.js';
import {ChoroplethController, ColorScale, GeoFeature, ProjectionScale} from 'chartjs-chart-geo';
import * as topojson from 'topojson-client';
import {Feature, FeatureCollection, Geometry} from 'geojson';
import {BehaviorSubject, EMPTY, map, Observable} from "rxjs";
import {ScienceItem} from "../../domain/news/types/science-item.interface";
import {countryCodes} from "../../resorces/country_mapper"
import {DataService} from '../../utils/data.service';
import {AsyncPipe, SlicePipe} from "@angular/common";
import {PieChartComponent} from "../../ui/charts/pie-chart/pie.chart";
import {BarchartComponent} from "../../ui/charts/bar-chart/bar.chart";

Chart.register(...registerables, ChoroplethController, ColorScale, GeoFeature, ProjectionScale);

@Component({
    standalone: true,
    selector: 'app-live-reporting',
    imports: [AsyncPipe, PieChartComponent, BarchartComponent],
    styles: `
      canvas {
        width: 75%;
      }

      .grid-container {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        height: 10vh; /* or whatever height you want for the container */
        align-items: center;
        justify-content: center;
        text-align: center; /* centers the text inside the elements */

      }

      .centered-element {
        position: relative;
        padding: 20px 0; /* Add some padding to make space for the lines */
      }

      .centered-element:before,
      .centered-element:after {
        content: "";
        position: absolute;
        left: 10%;
        right: 10%;
        height: 1px; /* Line height */
        background: black; /* Line color */
      }

      .centered-element:before {
        top: 0;
      }

      .centered-element:after {
        bottom: 0;
      }
    `,
    template: `
        <div class="w-full">
            <canvas id="geoChart" #geoChart></canvas>
            <div class="grid grid-cols-4 h-container grid-container">
                <div>
                    <b>{{ textToDisplay$ | async }}</b>
                    <p> Publications in the period</p>
                </div>
                <div>
                    <b>{{ textPercentageToDisplay$ | async }}</b>
                    <p>Measured indicators</p>
                </div>
                <div>
                    <b>{{ textMediaToDisplay$ | async }}</b>
                    <p>Exposure to the Media</p>
                </div>
                <div>
                    <b>{{ textPolicyToDisplay$ | async }}</b>
                    <p>SDG AI Polices</p>
                </div>
            </div>

            <div class="grid grid-cols-2 px-6">
                <div class="chart-container">
                    <app-piechart [sdg]="this.sdg()"></app-piechart>
                </div>
                <div>
                    <app-barchart [sdg]="this.sdg()"></app-barchart>
                </div>
            </div>
        </div>
    `,
})

export default class LiveReportingPage implements AfterViewInit {

    public sdg = input.required<string>();
    public map_color = input.required<string>();

    constructor(private http: HttpClient, private dataService: DataService) {
    }

    canvas: any;
    ctx: any;
    @ViewChild("geoChart") geoChart!: ElementRef;
    public textToDisplay$ = new BehaviorSubject('0');
    public textMediaToDisplay$: Observable<string> = EMPTY;
    public textPolicyToDisplay$ = new BehaviorSubject('0');
    public textPercentageToDisplay$ = new BehaviorSubject('0 %');


    ngAfterViewInit() {
        this.createGeoChart();

        try {
            this.dataService.getScienceCount(this.sdg()).subscribe(response => {
                this.textToDisplay$.next(response.toLocaleString('en-US'))

                this.dataService.getScienceAllCount(this.sdg()).subscribe(res => {
                    const p = Math.round((response / res) * 100).toFixed(2)
                    this.textPercentageToDisplay$.next(`${p} %`)
                })
                //this.textToDisplay$.next(false)
            })

            this.dataService.getPolicyCount(this.sdg()).subscribe(response => {
                this.textPolicyToDisplay$.next(response.toLocaleString('en-US'))
            })
        } catch (error) {
            console.error('Error creating Geo chart:', error);
        }

        this.textMediaToDisplay$ = this.dataService.getMediaCount(this.sdg())
            .pipe(
                map(response => response.toLocaleString('en-US'))
            );
    }

    private hexToRgbA(hex: string, alpha: number) {
        const bigint = parseInt(hex, 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;

        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    public async showMaps(scienceItem: ScienceItem[]) {


        //const world = await this.http.get<any>('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json').toPromise();
        const world = await this.http.get<any>('/assets/world-geojson2.json').toPromise();
        if (!world || !world.objects || !world.objects.countries) {
            throw new Error('Invalid TopoJSON data');
        }
        const rearranged = scienceItem.reduce((acc, item) => {
            acc[item.key] = item.doc_count;
            return acc;
        }, {} as { [key: string]: number });

        // Convert TopoJSON to GeoJSON
        const countries = topojson.feature(world, world.objects.countries as any) as unknown as FeatureCollection<Geometry, {
            name: string
        }>;

        // Ensure the countries have the expected structure
        if (!countries.features) {
            throw new Error('Invalid GeoJSON data');
        }

        // Map the data to the countries
        const data = countries.features.map((feature: Feature<Geometry, { name: string }>) => ({
            feature: feature,
            value: rearranged[countryCodes[feature.properties.name]] || 0 // Random data for demonstration

        }));

        this.canvas = this.geoChart.nativeElement;
        this.ctx = this.canvas.getContext("2d");
        const chart = new Chart(this.ctx, {
            type: 'choropleth',
            data: {
                labels: countries.features.map((d: Feature<Geometry, { name: string }>) => d.properties.name),
                datasets: [{
                    label: 'Countries',
                    data: data,
                    // backgroundColor: (context) => {
                    //     if (context.dataIndex !== undefined) {
                    //         const value = context.dataset.data[context.dataIndex].value;
                    //         const opacity = (value - 10000) / 10000;
                    //         return `rgba(244, 4, 0, ${opacity + 0.5})`;
                    //     } else {
                    //         return `rgba(244, 4, 0, ${0})`;
                    //     }
                    // },
                    borderColor: '#808080',
                    borderWidth: 1
                }]
            },
            options: {
                showOutline: true,
                plugins: {
                    legend: {
                        display: false
                    }
                }
                ,
                scales: {
                    projection: {
                        axis: 'y',
                        projection: 'naturalEarth1'
                    },
                    color: {
                        axis: 'x',
                        interpolate: (v) => {
                            const rgba: string = this.hexToRgbA(this.map_color(), v);
                            return rgba
                        },
                        //interpolate: this.map_color(),
                        //missing: '#ffffff',
                        missing: '#000000',
                        //interpolate: (v) => (v < 0.5 ? 'green' : 'red'),
                        legend: {
                            position: 'bottom',
                            align: 'bottom',
                            indicatorWidth: 20,
                            length: 500,
                            margin: 30
                        },
                    },
                }
            }
        });

    }

    async createGeoChart() {
        try {
            this.dataService.getScience(this.sdg()).subscribe(science => this.showMaps(science))
        } catch (error) {
            console.error('Error creating Geo chart:', error);
        }
    }
}
