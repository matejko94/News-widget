import {AfterViewInit, Component, ElementRef, input, ViewChild} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Chart, registerables} from 'chart.js';
import {ChoroplethController, ColorScale, GeoFeature, ProjectionScale} from 'chartjs-chart-geo';
import * as topojson from 'topojson-client';
import {Feature, FeatureCollection, Geometry} from 'geojson';
//import {BehaviorSubject, catchError, map, Observable, of, shareReplay} from "rxjs";
import { BehaviorSubject, delay, EMPTY, filter, map, Observable, pairwise, shareReplay, startWith, switchMap, tap } from "rxjs";
import {environment} from "../../environment";
import {ScienceDto} from "../../domain/news/entity/science-dto.interface";
import {ScienceItem} from "../../domain/news/entity/science-item.interface";
import {countryCodes} from "../../resorces/country_mapper"
import { DataService } from '../../utils/data.service';
import {AsyncPipe, SlicePipe} from "@angular/common";
import {PieChartComponent} from "../../ui/pie-chart/pie.chart";
import {BarchartComponent} from "../../ui/bar-chart/bar.chart";

// Register the necessary Chart.js components and the Geo chart controller
Chart.register(...registerables, ChoroplethController, ColorScale, GeoFeature, ProjectionScale);

@Component({
    standalone: true,
    selector: 'app-live-reporting',
    imports: [AsyncPipe, SlicePipe, PieChartComponent, BarchartComponent],
    template: `
            <head>
                <link rel="icon" href="https://sdg-observatory.ircai.org/wp-content/uploads/2023/08/cropped-cropped-IRCAI_favikon-32x32.png" />
                <meta charset="UTF-8">
                <meta name="viewport"
                      content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
                <meta http-equiv="X-UA-Compatible" content="ie=edge">
                <title>{{this.sdg()}}</title>
            </head>
            <body>>
                <div style="width:100%;">
                    <canvas id="geoChart" #geoChart></canvas>
                    <div class="grid grid-cols-4 h-container grid-container">
                        <div class="centered-element">
                            <b>{{ textToDisplay$ | async }}</b>
                            <p> Publications in the period</p>
                        </div>
                        <div class="centered-element">
                            <b>{{ textPercentageToDisplay$ | async }}</b>
                            <p>Measured indicators</p>
                        </div>
                        <div class="centered-element">
                            <b>{{ textMediaToDisplay$ | async }}</b>
                            <p>Exposure to the Media</p>
                        </div>
                        <div class="centered-element">
                            <b>{{ textPolicyToDisplay$ | async }}</b>
                            <p>SDG AI Polices</p>
                        </div>
                    </div>
                     
                    <div class="grid grid-cols-2">
                        <div class="chart-container">
                            <app-piechart [sdg]="this.sdg()"></app-piechart>
                        </div>
                        <div class="chart-container">
                            <app-barchart [sdg]="this.sdg()"></app-barchart>
                        </div>
                    </div>
                </div>
            </body>
    `,
    styleUrls: ['./app.component.css']
})

export default class LiveReportingPage implements AfterViewInit {

    public sdg = input.required<string>();
    public map_color = input.required<string>();
    constructor(private http: HttpClient, private dataService: DataService) {
    }

    canvas: any;
    ctx: any;
    @ViewChild("geoChart") geoChart!: ElementRef;
    public textToDisplay$  =  new BehaviorSubject('0');
    public textMediaToDisplay$  =  new BehaviorSubject('0');
    public textPolicyToDisplay$  =  new BehaviorSubject('0');
    public textPercentageToDisplay$  =  new BehaviorSubject('0 %');


    ngAfterViewInit() {
        this.createGeoChart();

        try {
            this.dataService.getScienceCount(this.sdg()).subscribe(response => {
                console.log(response)
                this.textToDisplay$.next(response.toLocaleString('en-US'))

                this.dataService.getScienceAllCount(this.sdg()).subscribe(res => {
                    console.log(res)
                    const p = Math.round((response/res)*100).toFixed(2)
                    this.textPercentageToDisplay$.next(`${p} %`)
                })
                //this.textToDisplay$.next(false)
            })

            this.dataService.getMediaCount(this.sdg()).subscribe(response => {
                this.textMediaToDisplay$.next(response.toLocaleString('en-US'))
            })

            this.dataService.getPolicyCount(this.sdg()).subscribe(response => {
                console.log(response)
                this.textPolicyToDisplay$.next(response.toLocaleString('en-US'))
            })
        } catch (error) {
            console.error('Error creating Geo chart:', error);
        }
    }


    hexToRgbA(hex:string, alpha: number){
        if (hex == undefined) {
            hex = 'df1010'
        }

        var r = parseInt(hex.slice(1, 3), 16),
            g = parseInt(hex.slice(3, 5), 16),
            b = parseInt(hex.slice(5, 7), 16);


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

        console.log(rearranged)

        // Convert TopoJSON to GeoJSON
        const countries = topojson.feature(world, world.objects.countries as any) as unknown as FeatureCollection<Geometry, {
            name: string
        }>;

        // Ensure the countries have the expected structure
        if (!countries.features) {
            throw new Error('Invalid GeoJSON data');
        }
        console.log(countries.features)

        // Map the data to the countries
        const data = countries.features.map((feature: Feature<Geometry, { name: string }>) => ({
            feature: feature,
            value: rearranged[countryCodes[feature.properties.name]] || 0 // Random data for demonstration

        }));

        this.canvas = this.geoChart.nativeElement;
        this.ctx = this.canvas.getContext("2d");
        console.log(this.ctx);
        // Create the chart
        const chart = new Chart(this.ctx, {
            type: 'choropleth',
            data: {
                labels: countries.features.map((d: Feature<Geometry, { name: string }>) => d.properties.name),
                datasets: [{
                    label: 'Countries',
                    data: data,
                    // backgroundColor: (context) => {
                    //     // console.log(context.datasetIndex)
                    //     // console.log(context)
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

    protected readonly sentimentAverage$ = EMPTY;
}