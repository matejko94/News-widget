import { ChangeDetectionStrategy, Component, computed, inject, input } from "@angular/core";
import { AsyncPipe } from "@angular/common";
import { GoogleMap, MapCircle } from "@angular/google-maps";
import { catchError, EMPTY, map, Observable, of, take } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { CircleItem } from "../entities/circle-item";
import { NewsItem } from "../entities/news-item.interface";

@Component({
    selector: 'app-heatmap',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        AsyncPipe,
        GoogleMap,
        MapCircle
    ],
    template: `
        @if (mapInitialized | async) {
            <google-map [height]="mapHeight() ?? 'auto'" width="100%" [zoom]="zoom()"
                        [center]="location()"
                        [options]="{ disableDefaultUI: true, minZoom: this.zoom(), 
                        restriction: { latLngBounds: { north: 85, south: -85, west: -180, east: 180}}}">

                @for (pos of markerPositions(); track pos.country) {
                    <map-circle [center]="pos.c" [title]="pos.country" [options]="pos.options"/>
                }
            </google-map>
        }
    `
})
export class HeatmapComponent {
    private http = inject(HttpClient);

    googleMapsApiKey = input.required<string | undefined>();
    mapHeight = input.required<string | undefined>();
    zoom = input.required<number>();
    location = input.required<google.maps.LatLngLiteral>();
    newsItems = input.required<NewsItem[] | null>();
    public mapInitialized: Observable<boolean> = EMPTY;
    public markerPositions = computed(() => this.createMarkerPositions(this.newsItems()));

    public ngOnInit() {
        console.log(this)
        this.mapInitialized = this.initializeMap();
    }

    private initializeMap() {
        if (!this.googleMapsApiKey()) {
            return of(false);
        }

        return this.http.jsonp(`https://maps.googleapis.com/maps/api/js?key=${ this.googleMapsApiKey() }`, 'callback')
            .pipe(
                take(1),
                map(() => true),
                catchError(e => {
                    console.error('failed to initialize google maps', e);
                    return of(false)
                }),
            )
    }

    private createMarkerPositions(newsItems: NewsItem[] | null) {
        const positions = new Map<string, CircleItem>();

        newsItems?.forEach(item => {
            if (item._source.source.location?.country) {
                const country = item._source.source.location.country?.label?.['eng'];
                const color = this.getColorForValue(item._source.sentiment ?? 0);

                positions.set(country, {
                    c: {
                        lat: item._source.source.location.country.lat,
                        lng: item._source.source.location.country.long,
                    },
                    country: country,
                    options: {
                        fillColor: color,
                        radius: 1000000,
                        strokeWeight: 1,
                        strokeColor: color
                    }
                })
            }
        });

        return [ ...positions.values() ];
    }

    private getColorForValue(value: number) {
        return `hsl(${ ((1 - value) / 2) * 120 }, ${ 100 }%, ${ 50 }%)`;
    }

}
