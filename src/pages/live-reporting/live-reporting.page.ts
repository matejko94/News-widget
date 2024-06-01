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

// Register the necessary Chart.js components and the Geo chart controller
Chart.register(...registerables, ChoroplethController, ColorScale, GeoFeature, ProjectionScale);

@Component({
    standalone: true,
    selector: 'app-live-reporting',
    imports: [AsyncPipe, SlicePipe, PieChartComponent],
    template: `
        <div style="width:100%;">
            <canvas id="geoChart" #geoChart></canvas>
            <div class="grid grid-cols-4 h-container grid-container">
                <div class="centered-element">
                    <b>{{ textToDisplay$ | async }}</b>
                    <p> Publications in the period</p>
                </div>
                <div class="centered-element">
                    <b>{{ textPercentageToDisplay$ | async }}</b>
                    <p>Compound annual growth rate</p>
                </div>
                <div class="centered-element">
                    <b>{{ textMediaToDisplay$ | async }}</b>
                    <p>International collaboration</p>
                </div>
                <div class="centered-element">
                    <b>{{ textPolicyToDisplay$ | async }}</b>
                    <p>Academic-corporate collaboration</p>
                </div>
            </div>
             
            <div class="grid grid-cols-2">
                <app-piechart [sdg]="this.sdg()"></app-piechart>   
            </div>

        </div>`,
    styleUrls: ['./app.component.css']
})

export default class LiveReportingPage implements AfterViewInit {

    public sdg = input.required<string>();
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


    public async showMaps(scienceItem: ScienceItem[]) {


        const world = await this.http.get<any>('https://unpkg.com/world-atlas/countries-50m').toPromise();
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
                    borderColor: '#000000',
                    borderWidth: 1
                }]
            },
            options: {
                plugins: {
                    legend: {
                        display: false
                    }
                }
                ,
                scales: {
                    projection: {
                        axis: 'x',
                        projection: 'mercator'
                    },
                    color: {
                        axis: 'x',
                        interpolate: (v) => `rgba(244, 4, 0, ${v})`,
                        //interpolate: (v) => (v < 0.5 ? 'green' : 'red'),
                        legend: {
                          position: 'top',
                          align: 'top',
                          indicatorWidth: 20,
                          margin: 15
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