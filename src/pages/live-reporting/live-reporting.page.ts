import {AfterViewInit, Component, ElementRef, input, ViewChild} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Chart, registerables} from 'chart.js';
import {ChoroplethController, ColorScale, GeoFeature, ProjectionScale} from 'chartjs-chart-geo';
import * as topojson from 'topojson-client';
import {Feature, FeatureCollection, Geometry} from 'geojson';
import {catchError, map, Observable, of, shareReplay} from "rxjs";
import {environment} from "../../environment";
import {ScienceDto} from "../../domain/news/entity/science-dto.interface";
import {ScienceItem} from "../../domain/news/entity/science-item.interface";
import {countryCodes} from "../../resorces/country_mapper"

// Register the necessary Chart.js components and the Geo chart controller
Chart.register(...registerables, ChoroplethController, ColorScale, GeoFeature, ProjectionScale);

@Component({
    standalone: true,
    selector: 'app-live-reporting',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})

export default class LiveReportingPage implements AfterViewInit {

    public sdg = input.required<string>();
    constructor(private http: HttpClient) {
    }

    canvas: any;
    ctx: any;
    @ViewChild("geoChart") geoChart!: ElementRef;


    ngAfterViewInit() {
        this.createGeoChart();
    }

    public getNews(sdg: string): Observable<ScienceItem[]> {
        return this.http.post<ScienceDto>(
            environment.api.science.url,
            {
                "size": 0,
                "query": {
                    "bool": {
                        "filter": [
                            {
                                "match": {
                                    "SDG.keyword": `SDG ${sdg}`
                                }
                            }
                        ]
                    }
                },
                "aggs": {
                    "countries": {
                        "terms": {
                            "field": "authorships.institutions.country_code.keyword",
                            "size": 200
                        }
                    }
                }
            },
            {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + environment.api.news.auth,
                }),
            }).pipe(
            map(response => response.aggregations.countries.buckets),
            catchError(e => {
                console.error('failed to fetch data', e);
                return of([])
            }),
            shareReplay(1)
        )
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

            this.getNews(this.sdg()).subscribe(science => this.showMaps(science))


        } catch (error) {
            console.error('Error creating Geo chart:', error);
        }
    }
}