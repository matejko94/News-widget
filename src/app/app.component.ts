import { ChangeDetectionStrategy, Component, ElementRef, inject, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { GoogleMapsModule } from "@angular/google-maps";
import { BehaviorSubject, catchError, combineLatestWith, delay, distinctUntilChanged, EMPTY, filter, map, Observable, of, pairwise, shareReplay, startWith, switchMap, take, tap } from "rxjs";
import { log } from "./util/error.logger";
import { AsyncPipe, DatePipe, JsonPipe, SlicePipe } from "@angular/common";
import { NewsItem } from "./entities/news-item.interface";
import { SentimentMeterComponent } from "./components/sentiment-meter/sentiment-meter.component";

function toNumber(value: string | number) {
  return Number(value)
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ GoogleMapsModule, AsyncPipe, SentimentMeterComponent, DatePipe, JsonPipe, SlicePipe ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  styles: [ `
    @import "../styles";

    @tailwind base;
    @tailwind components;
    @tailwind utilities;

    :host {
      display: block;
      width: 100%;
      height: 100%;
      padding: 0.25rem;
    }

    google-map .map-container {
      aspect-ratio: 16 / 9;
    }
  ` ],
  template: `
    @if (mapInitialized$ | async) {
      <google-map [height]="mapHeight ?? 'auto'" width="100%" [zoom]="zoom" [center]="{lat, lng}"
                  [options]="{disableDefaultUI: true, minZoom: zoom, restriction: {
                    latLngBounds: {
                      north: 85,
                      south: -85,
                      west: -180,
                      east: 180
                    }
                  } }">
        @for (position of markerPositions$ | async; track position) {
          <map-marker [position]="position.c" [options]="{draggable: false}" [title]="position.country"/>
        }
      </google-map>
    }

    <div class="grid grid-cols-2 gap-4 h-0">
      <div class="overflow-y-auto">
        @for (newsItem of data$ | async; track newsItem._source.url) {
          <div class="border-b-2 my-3" [title]="(newsItem._source.body | slice:0:100) + '...'">
            <a class="font-semibold text-lg mb-2" [href]="newsItem._source.url">
              {{ newsItem._source.title | slice:0:100 }}
            </a>
            <div
              class="text-gray-500 text-lg">{{ newsItem._source.dateTimePub | date: 'EEE MMM d yyyy, HH:mm': 'UTC' }}
            </div>
          </div>
        }
      </div>

      <div class="self-start">
        <app-sentiment-meter [value]="sentiment$ | async"/>
        <div class="flex justify-between gap-4 mt-4 w-full">
          <div class="text-lg">
            <div>Showing: <b>{{ loadedDate$ | async | date: 'dd.MM.yyyy' }}</b></div>
            <div>Total: <b>{{ (data$ | async)?.length }}</b> | Sentiment: <b>{{ sentiment$ | async }}</b></div>
          </div>
          @if (isPlaying$ | async) {
            <button (click)="resetDays()"
                    class="h-fit bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Reset
            </button>
          } @else {
            <button (click)="startCountdown()"
                    class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded h-fit">
              Play
            </button>
          }
        </div>
      </div>
    </div>
  `,
})
export class AppComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private host = inject(ElementRef);

  @Input({alias: 'google-maps-api-key'}) public googleMapsApiKey?: string;
  @Input({alias: 'elastic-search-url'}) public elasticSearchUrl?: string;
  @Input({alias: 'min-date'}) public minDate!: string;
  @Input({alias: 'max-date'}) public maxDate!: string;
  @Input({alias: 'map-height'}) public mapHeight?: string;
  @Input({alias: 'delay-ms', transform: toNumber}) public delayMs?: number;
  @Input({transform: toNumber}) public zoom: number = 0;
  @Input({transform: toNumber}) public lat: number = 0;
  @Input({transform: toNumber}) public lng: number = 0;
  public shownDate$ = new BehaviorSubject(new Date());
  public loadedDate$ = new BehaviorSubject(new Date());
  public mapInitialized$: Observable<boolean> = EMPTY;
  public markerPositions$: Observable<{ c: google.maps.LatLngLiteral, country: string }[]> = EMPTY;
  public isLoading$ = new BehaviorSubject(true);
  public sdg$: Observable<string | null> = EMPTY;
  public data$: Observable<NewsItem[]> = EMPTY;
  public sentiment$: Observable<number> = EMPTY;
  public isPlaying$ = new BehaviorSubject(false);

  public ngOnInit() {
    if (!this.googleMapsApiKey) log.error('missing google maps api key');
    if (!this.elasticSearchUrl) log.error('missing elastic search url');
    if (!this.minDate) log.error('missing min date');
    if (!this.maxDate) log.error('missing max date');
    if (!this.delayMs) log.error('missing delay ms');

    this.router.initialNavigation();

    this.shownDate$.next(new Date(this.maxDate));
    this.mapInitialized$ = this.initializeMap();
    this.sdg$ = this.initializeSdg();
    this.data$ = this.initializeData();
    this.sentiment$ = this.initializeSentiment();
    this.markerPositions$ = this.initializeMarkerPositions();

    this.isLoading$.pipe(
      startWith(true),
      pairwise(),
      filter(([ prev, next ]) => prev && !next),
      delay(this.delayMs ?? 0),
      switchMap(() => this.isPlaying$),
      filter(isPlaying => !!isPlaying),
      tap(() => {
        const currentDate = new Date(this.shownDate$.value);
        this.shownDate$.next(new Date(currentDate.setDate(currentDate.getDate() - 1)));

        if (this.shownDate$.value < new Date(this.minDate)) {
          this.isPlaying$.next(false);
        }
      })
    ).subscribe()
  }

  private initializeMap() {
    if (!this.googleMapsApiKey) {
      return of(false);
    }

    return this.http.jsonp(`https://maps.googleapis.com/maps/api/js?key=${ this.googleMapsApiKey }`, 'callback')
      .pipe(
        take(1),
        map(() => true),
        catchError(e => {
          log.error('failed to initialize google maps', e);
          return of(false)
        }),
      )
  }

  private initializeSdg() {
    return this.route.queryParamMap.pipe(
      map(params => params.get('SDG')),
      distinctUntilChanged(),
    )
  }

  private initializeData() {
    if (!this.elasticSearchUrl) {
      return of([]);
    }

    return this.sdg$.pipe(
      combineLatestWith(this.shownDate$),
      filter(([ _, shownDate ]) => shownDate >= new Date(this.minDate)),
      tap(() => this.isLoading$.next(true)),
      switchMap(([ sdg, shownDate ]) => this.http.post<{ hits: { hits: NewsItem[] } }>(this.elasticSearchUrl!,
        {
          "size": 10000,
          "query": {
            "bool": {
              "must": [
                {
                  "match": {
                    "SDG.keyword": `SDG ${ sdg }`
                  }
                },
                {
                  "range": {
                    "dateTimePub": {
                      "gte": shownDate.toISOString(),
                      "lt": new Date(new Date(shownDate).setDate(shownDate.getDate() + 1)).toISOString(),
                    }
                  }
                }
              ]
            }
          }
        },
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa('elastic:changeme'),
          }),
        })),
      map(response => response.hits.hits),
      catchError(e => {
        log.error('failed to fetch data', e);
        return of([])
      }),
      tap(() => {
        this.loadedDate$.next(this.shownDate$.value);
        this.isLoading$.next(false);
      }),
      shareReplay(1),
    )
  }

  private initializeSentiment() {
    return this.data$.pipe(
      map(data => {
        let total = 0;
        let sentiment = 0;

        data.forEach(item => {
          if (item._source.sentiment !== null && item._source.sentiment !== undefined) {
            total++;
            sentiment += item._source.sentiment;
          }
        })

        return Math.round((sentiment / total) * 100) / 100;
      }),
      shareReplay(1),
    )
  }

  private initializeMarkerPositions() {
    return this.data$.pipe(
      map(data => {
        const positions = new Map<string, { c: google.maps.LatLngLiteral, country: string }>()

        data.forEach((item => {
          if (item._source.source.location?.country) {
            const country = item._source.source.location.country?.label?.['eng'];
            positions.set(country, {
              c: {
                lat: item._source.source.location.country.lat,
                lng: item._source.source.location.country.long,
              },
              country: country,
            })
          }
        }));

        return [ ...positions.values() ];
      }),
    )
  }

  public startCountdown() {
    this.isPlaying$.next(true);
  }

  public resetDays() {
    this.shownDate$.next(new Date(this.maxDate));
    this.isPlaying$.next(false);
  }

}
