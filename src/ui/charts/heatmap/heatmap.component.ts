import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit } from "@angular/core";
import { AsyncPipe } from "@angular/common";
import { GoogleMap, MapCircle } from "@angular/google-maps";
import { catchError, EMPTY, map, Observable, of, take } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { NewsItem } from "../../../domain/news/entity/news-item.interface";
import {environment} from "../../../../environment/environment";

interface CircleItem {
    c: {
        lat: number,
        lng: number,
    },
    country: string,
    options: google.maps.CircleOptions
}

@Component({
    selector: 'app-heatmap',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        AsyncPipe,
        GoogleMap,
        MapCircle
    ],
    styles: [ `
      :host {
        display: block;
        width: 100%;
        height: 100%;
        aspect-ratio: 16 / 8;
      }

      ::ng-deep google-map .map-container {
        aspect-ratio: 16 / 8;
      }
    ` ],
    template: `
        @if (mapInitialized$ | async) {
            <google-map [height]="mapHeight()" width="100%" [zoom]="zoom()"
                        [center]="location()" [options]="mapOptions()">
                @for (pos of markerPositions(); track pos.country) {
                    <map-circle [center]="pos.c" [title]="pos.country" [options]="pos.options"/>
                }
            </google-map>
        }
    `
})
export class HeatmapComponent implements OnInit {
    private http = inject(HttpClient);

    public newsItems = input.required<NewsItem[] | null>();
    public mapHeight = input.required<string>();
    public mapCircleRadiusFactor = input.required<number>();
    public zoom = input.required<number>();
    public location = input.required<{ lat: number, lng: number }>();
    public mapOptions = computed(() => this.createMapOptions(this.zoom()));
    public markerPositions = computed(() => this.createMarkerPositions(this.newsItems(), this.mapCircleRadiusFactor()));
    public mapInitialized$: Observable<boolean> = EMPTY;

    public ngOnInit() {
        this.mapInitialized$ = this.initializeMap();
    }

    private createMapOptions(zoom: number) {
        return {
            disableDefaultUI: true,
            minZoom: zoom,
            restriction: {
                latLngBounds: {
                    north: 85,
                    south: -85,
                    west: -180,
                    east: 180
                }
            },
        styles: [
            {
              "featureType": "administrative.country",
              "elementType": "labels",
              "stylers": [
                { "visibility": "off" }
              ]
            },{
                    "featureType": "water",
                    "elementType": "geometry",
                    "stylers": [{ "lightness": 17 }]
            }
          ]
        }
    }

    private initializeMap() {
        return this.http.jsonp(
            `https://maps.googleapis.com/maps/api/js?key=${ environment.api.googleMaps.apiKey }`,
            'callback'
        ).pipe(
            take(1),
            map(() => true),
            catchError(e => {
                console.error('failed to initialize google maps', e);
                return of(false)
            }),
        )
    }

    private createMarkerPositions(newsItems: NewsItem[] | null, circleRadius: number): CircleItem[] {
        const totalNews = newsItems?.length ?? 0;
        const countrySentiment = new Map<string, {
            count: number,
            location: google.maps.LatLngLiteral,
            sentiment: number
        }>();

        newsItems
            ?.filter(item => item._source.source.location?.country)
            .forEach(item => {
                const country = item._source.source.location.country?.label?.['eng'];
                const sentiment = item._source.sentiment ?? 0;
                const {lat, long: lng} = item._source.source.location.country;

                if (countrySentiment.has(country)) {
                    const current = countrySentiment.get(country)!;

                    countrySentiment.set(country, {
                        count: current.count + 1,
                        location: current.location,
                        sentiment: (current.sentiment * current.count + sentiment) / (current.count + 1)
                    })
                } else {
                    countrySentiment.set(country, {count: 1, location: {lat, lng}, sentiment})
                }
            });

        return [ ...countrySentiment.entries() ]
            .map(([ country, {location, sentiment, count} ]) => ({
                country,
                c: location,
                options: {
                    fillColor: this.getColorForValue(sentiment),
                    radius: (5000000 * circleRadius) * (count / totalNews),
                    strokeWeight: 2,
                    fillOpacity: 0.6,
                    strokeColor: this.getColorForValue(sentiment)
                }
            }));
    }

    private getColorForValue(value: number) {
        return `hsl(${ ((value + 1) / 2) * 120 }, ${ 100 }%, ${ 50 }%)`;
    }

}
