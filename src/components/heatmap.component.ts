import { ChangeDetectionStrategy, Component, computed, inject, input } from "@angular/core";
import { AsyncPipe } from "@angular/common";
import { GoogleMap, MapCircle } from "@angular/google-maps";
import { catchError, EMPTY, map, Observable, of, take, tap } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { NewsItem } from "../entities/news-item.interface";
import { CircleItem } from "../entities/circle-item";
import { APP_CONFIG } from "../config";

@Component({
    selector: 'app-heatmap',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        AsyncPipe,
        GoogleMap,
        MapCircle
    ],
    styles: [`
        ::ng-deep google-map .map-container {
            aspect-ratio: 16 / 8;
        }
    `],
    template: `
        @if (mapInitialized$ | async) {
            <google-map [height]="mapHeight" width="100%" [zoom]="zoom" [center]="location" [options]="mapOptions">
                @for (pos of markerPositions(); track pos.country) {
                    <map-circle [center]="pos.c" [title]="pos.country" [options]="pos.options"/>
                }
            </google-map>
        }
    `
})
export class HeatmapComponent {
    private http = inject(HttpClient);
    private appConfig = inject(APP_CONFIG);

    newsItems = input.required<NewsItem[] | null>();
    mapHeight = this.appConfig.mapHeight;
    mapCircleRadiusFactor = this.appConfig.mapCircleRadiusFactor;
    zoom = this.appConfig.zoom;
    location = {
        lat: this.appConfig.lat,
        lng: this.appConfig.lng
    };
    public mapOptions = {
        disableDefaultUI: true,
        minZoom: this.appConfig.zoom,
        restriction: {
            latLngBounds:
                {
                    north: 85,
                    south: -85,
                    west: -180,
                    east: 180
                }
        }
    }
    public mapInitialized$: Observable<boolean> = EMPTY;
    public markerPositions = computed(() => this.createMarkerPositions(this.newsItems()));

    public ngOnInit() {
        this.mapInitialized$ = this.initializeMap();
    }

    private initializeMap() {
        return this.http.jsonp(`https://maps.googleapis.com/maps/api/js?key=${ this.appConfig.googleMapsApiKey }`, 'callback')
            .pipe(
                take(1),
                map(() => true),
                catchError(e => {
                    console.error('failed to initialize google maps', e);
                    return of(false)
                }),
            )
    }

    private createMarkerPositions(newsItems: NewsItem[] | null): CircleItem[] {
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
                    radius: (5000000 * this.mapCircleRadiusFactor) * (count / totalNews),
                    strokeWeight: 1,
                    strokeColor: this.getColorForValue(sentiment)
                }
            }));
    }

    private getColorForValue(value: number) {
        return `hsl(${ ((1 - value) / 2) * 120 }, ${ 100 }%, ${ 50 }%)`;
    }

}
