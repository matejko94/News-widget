import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Chart, registerables} from 'chart.js';
import {ChoroplethController, ColorScale, GeoFeature, ProjectionScale} from 'chartjs-chart-geo';
import * as topojson from 'topojson-client';
import {Feature, FeatureCollection, Geometry} from 'geojson';
import {catchError, map, Observable, of, shareReplay} from "rxjs";
import {environment} from "../../environment";
import {ScienceDto} from "../../domain/news/entity/science-dto.interface";
import {ScienceItem} from "../../domain/news/entity/science-item.interface";

// Register the necessary Chart.js components and the Geo chart controller
Chart.register(...registerables, ChoroplethController, ColorScale, GeoFeature, ProjectionScale);

@Component({
    standalone: true,
    selector: 'app-live-reporting',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})

export default class LiveReportingPage implements AfterViewInit {
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
        const countryCodes: { [key: string]: string } = {
            'Afghanistan': 'AF',
            'Albania': 'AL',
            'Algeria': 'DZ',
            'Andorra': 'AD',
            'Angola': 'AO',
            'Antigua and Barbuda': 'AG',
            'Argentina': 'AR',
            'Armenia': 'AM',
            'Australia': 'AU',
            'Austria': 'AT',
            'Azerbaijan': 'AZ',
            'Bahamas': 'BS',
            'Bahrain': 'BH',
            'Bangladesh': 'BD',
            'Barbados': 'BB',
            'Belarus': 'BY',
            'Belgium': 'BE',
            'Belize': 'BZ',
            'Benin': 'BJ',
            'Bhutan': 'BT',
            'Bolivia': 'BO',
            'Bosnia and Herzegovina': 'BA',
            'Botswana': 'BW',
            'Brazil': 'BR',
            'Brunei': 'BN',
            'Bulgaria': 'BG',
            'Burkina Faso': 'BF',
            'Burundi': 'BI',
            'Cabo Verde': 'CV',
            'Cambodia': 'KH',
            'Cameroon': 'CM',
            'Canada': 'CA',
            'Central African Republic': 'CF',
            'Chad': 'TD',
            'Chile': 'CL',
            'China': 'CN',
            'Colombia': 'CO',
            'Comoros': 'KM',
            'Congo (Congo-Brazzaville)': 'CG',
            'Costa Rica': 'CR',
            'Croatia': 'HR',
            'Cuba': 'CU',
            'Cyprus': 'CY',
            'Czechia (Czech Republic)': 'CZ',
            'Denmark': 'DK',
            'Djibouti': 'DJ',
            'Dominica': 'DM',
            'Dominican Republic': 'DO',
            'Ecuador': 'EC',
            'Egypt': 'EG',
            'El Salvador': 'SV',
            'Equatorial Guinea': 'GQ',
            'Eritrea': 'ER',
            'Estonia': 'EE',
            'Eswatini (fmr. "Swaziland")': 'SZ',
            'Ethiopia': 'ET',
            'Fiji': 'FJ',
            'Finland': 'FI',
            'France': 'FR',
            'Gabon': 'GA',
            'Gambia': 'GM',
            'Georgia': 'GE',
            'Germany': 'DE',
            'Ghana': 'GH',
            'Greece': 'GR',
            'Grenada': 'GD',
            'Guatemala': 'GT',
            'Guinea': 'GN',
            'Guinea-Bissau': 'GW',
            'Guyana': 'GY',
            'Haiti': 'HT',
            'Honduras': 'HN',
            'Hungary': 'HU',
            'Iceland': 'IS',
            'India': 'IN',
            'Indonesia': 'ID',
            'Iran': 'IR',
            'Iraq': 'IQ',
            'Ireland': 'IE',
            'Israel': 'IL',
            'Italy': 'IT',
            'Jamaica': 'JM',
            'Japan': 'JP',
            'Jordan': 'JO',
            'Kazakhstan': 'KZ',
            'Kenya': 'KE',
            'Kiribati': 'KI',
            'Kuwait': 'KW',
            'Kyrgyzstan': 'KG',
            'Laos': 'LA',
            'Latvia': 'LV',
            'Lebanon': 'LB',
            'Lesotho': 'LS',
            'Liberia': 'LR',
            'Libya': 'LY',
            'Liechtenstein': 'LI',
            'Lithuania': 'LT',
            'Luxembourg': 'LU',
            'Madagascar': 'MG',
            'Malawi': 'MW',
            'Malaysia': 'MY',
            'Maldives': 'MV',
            'Mali': 'ML',
            'Malta': 'MT',
            'Marshall Islands': 'MH',
            'Mauritania': 'MR',
            'Mauritius': 'MU',
            'Mexico': 'MX',
            'Micronesia': 'FM',
            'Moldova': 'MD',
            'Monaco': 'MC',
            'Mongolia': 'MN',
            'Montenegro': 'ME',
            'Morocco': 'MA',
            'Mozambique': 'MZ',
            'Myanmar (formerly Burma)': 'MM',
            'Namibia': 'NA',
            'Nauru': 'NR',
            'Nepal': 'NP',
            'Netherlands': 'NL',
            'New Zealand': 'NZ',
            'Nicaragua': 'NI',
            'Niger': 'NE',
            'Nigeria': 'NG',
            'North Korea': 'KP',
            'North Macedonia': 'MK',
            'Norway': 'NO',
            'Oman': 'OM',
            'Pakistan': 'PK',
            'Palau': 'PW',
            'Palestine State': 'PS',
            'Panama': 'PA',
            'Papua New Guinea': 'PG',
            'Paraguay': 'PY',
            'Peru': 'PE',
            'Philippines': 'PH',
            'Poland': 'PL',
            'Portugal': 'PT',
            'Qatar': 'QA',
            'Romania': 'RO',
            'Russia': 'RU',
            'Rwanda': 'RW',
            'Saint Kitts and Nevis': 'KN',
            'Saint Lucia': 'LC',
            'Saint Vincent and the Grenadines': 'VC',
            'Samoa': 'WS',
            'San Marino': 'SM',
            'Sao Tome and Principe': 'ST',
            'Saudi Arabia': 'SA',
            'Senegal': 'SN',
            'Serbia': 'RS',
            'Seychelles': 'SC',
            'Sierra Leone': 'SL',
            'Singapore': 'SG',
            'Slovakia': 'SK',
            'Slovenia': 'SI',
            'Solomon Islands': 'SB',
            'Somalia': 'SO',
            'South Africa': 'ZA',
            'South Korea': 'KR',
            'South Sudan': 'SS',
            'Spain': 'ES',
            'Sri Lanka': 'LK',
            'Sudan': 'SD',
            'Suriname': 'SR',
            'Sweden': 'SE',
            'Switzerland': 'CH',
            'Syria': 'SY',
            'Taiwan': 'TW',
            'Tajikistan': 'TJ',
            'Tanzania': 'TZ',
            'Thailand': 'TH',
            'Timor-Leste': 'TL',
            'Togo': 'TG',
            'Tonga': 'TO',
            'Trinidad and Tobago': 'TT',
            'Tunisia': 'TN',
            'Turkey': 'TR',
            'Turkmenistan': 'TM',
            'Tuvalu': 'TV',
            'Uganda': 'UG',
            'Ukraine': 'UA',
            'United Arab Emirates': 'AE',
            'United Kingdom': 'GB',
            'United States of America': 'US',
            'Uruguay': 'UY',
            'Uzbekistan': 'UZ',
            'Vanuatu': 'VU',
            'Venezuela': 'VE',
            'Vietnam': 'VN',
            'Yemen': 'YE',
            'Zambia': 'ZM',
            'Zimbabwe': 'ZW'
        };


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
            value: rearranged[countryCodes[feature.properties.name]] // Random data for demonstration

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
                    backgroundColor: (context) => {
                        // console.log(context.datasetIndex)
                        // console.log(context)
                        if (context.dataIndex !== undefined) {
                            const value = context.dataset.data[context.dataIndex].value;
                            const opacity = (value - 50) / 50;
                            return `rgba(244, 4, 0, ${opacity + 0.5})`;
                        } else {
                            return `rgba(244, 4, 0, ${0})`;
                        }
                    },
                    borderColor: '#FFFFFF',
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
                    // color: {
                    //     axis: 'x',
                    //     //interpolate: (v) => (v < 0.5 ? 'green' : 'red'),
                    //     legend: {
                    //       position: 'bottom-right',
                    //       align: 'right',
                    //     },
                    //   },
                }
            }
        });

    }

    async createGeoChart() {
        try {

            this.getNews('1').subscribe(science => this.showMaps(science))


        } catch (error) {
            console.error('Error creating Geo chart:', error);
        }
    }
}