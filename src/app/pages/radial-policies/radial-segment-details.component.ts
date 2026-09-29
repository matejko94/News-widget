import { Component, computed, effect, ElementRef, input, output, signal, viewChild } from '@angular/core';
import { RadialSegmentSelection } from '../../ui/charts/radial-stacked-chart/radial-stacked-chart.component';
import { SpinnerComponent } from '../../ui/components/spinner/spinner.component';

/** An event (conference, workshop, course) the clicked topic × SDG pair appears in. */
export interface SegmentEvent {
    id: number;
    title: string;
}

/**
 * Panel shown when a radial segment is clicked: what the segment counts, and which events the
 * counted material comes from.
 *
 * Each event links to a VideoLectures search for its title rather than straight to the event
 * page. The ids /education/whitespace returns (30177, 21273, ...) are legacy VideoLectures ids;
 * the current site addresses events by slug over its own id space (1..~1600), so there is no way
 * to build a direct URL from what we are given. Searching the title lands on the event whenever
 * it still exists there.
 *
 * The list pages in as it is scrolled. Today that pages a list the API returns in one go (it
 * caps out around 30 events), but the same plumbing serves the paginated per-lecture endpoint
 * once it exists — see specs/education-documents-endpoint.md.
 */
@Component({
    selector: 'app-radial-segment-details',
    standalone: true,
    imports: [ SpinnerComponent ],
    template: `
        <header class="flex items-start gap-3 px-4 py-3 border-b border-gray-200">
            <div class="flex-1 min-w-0">
                <h2 class="font-semibold text-lg leading-tight text-gray-900">{{ segment().groupLabel }}</h2>
                <span class="inline-block mt-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold text-white tracking-wide"
                      [style.background-color]="color()">{{ segment().label }}</span>
            </div>
            <button type="button" aria-label="Close"
                    class="shrink-0 w-8 h-8 -mr-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100
                           transition-colors text-2xl leading-none flex items-center justify-center"
                    (click)="close.emit()">&times;
            </button>
        </header>

        <div class="px-4 py-3 border-b border-gray-200 bg-gray-50/70">
            <div class="flex items-baseline gap-2">
                <span class="text-3xl font-bold tabular-nums text-gray-900">{{ segment().value }}</span>
                <span class="text-sm font-medium text-gray-500">documents · {{ share() }}% of the bar</span>
            </div>
            <p class="mt-1.5 text-sm text-gray-600">
                Video lectures in <b>{{ segment().groupLabel }}</b> classified as <b>{{ segment().label }}</b>.
            </p>
            <p class="mt-2 text-xs leading-relaxed text-gray-500">
                Counts come from the education index, not from news. A lecture can be classified into
                several SDGs, so it may be counted in more than one segment of the same bar.
            </p>
        </div>

        <div #scrollRoot class="flex-1 overflow-y-auto relative">
            <h3 class="px-4 pt-3 pb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Events this material comes from
            </h3>

            @if (loading()) {
                <div class="h-28"><app-spinner/></div>
            } @else if (events().length) {
                <ul class="px-2 pb-2">
                    @for (event of visibleEvents(); track event.id) {
                        <li>
                            <a class="group flex items-center gap-2 h-14 px-2 rounded-lg
                                      hover:bg-gray-100 transition-colors"
                               [href]="searchUrl(event)" target="_blank" rel="noopener noreferrer"
                               [title]="'Find &quot;' + event.title + '&quot; on VideoLectures'">
                                <span class="flex-1 min-w-0 text-sm leading-snug text-gray-800 line-clamp-2">
                                    {{ event.title.trim() }}
                                </span>
                                <svg class="shrink-0 w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors"
                                     viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                     stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                    <polyline points="15 3 21 3 21 9"/>
                                    <line x1="10" y1="14" x2="21" y2="3"/>
                                </svg>
                            </a>
                        </li>
                    }
                </ul>

                @if (hasMore()) {
                    <div #sentinel class="h-10 flex items-center justify-center text-xs text-gray-400">
                        Loading more…
                    </div>
                }
            } @else {
                <div class="px-4 py-6 text-sm text-gray-500">No events found for this segment.</div>
            }
        </div>

        <p class="px-4 py-2 border-t border-gray-200 text-[11px] leading-snug text-gray-500"
           title="The ids /education/whitespace returns are legacy VideoLectures ids and cannot be turned into a direct event link, so each event opens a search for its title. A per-lecture list needs the endpoint specified in specs/education-documents-endpoint.md.">
            Events open a VideoLectures <b>search</b> — the ids here are legacy and cannot be linked
            directly. A sample of where this topic and {{ segment().label }} co-occur, not all
            {{ segment().value }} documents.
        </p>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            background: #fff;
        }

        .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
    `
})
export class RadialSegmentDetailsComponent {
    private static readonly PAGE_SIZE = 8;
    private static readonly SEARCH_URL = 'https://videolectures.net/search';

    public segment = input.required<RadialSegmentSelection>();
    public events = input.required<SegmentEvent[]>();
    public loading = input.required<boolean>();
    public color = input<string>('#6B7280');
    public close = output<void>();

    private scrollRoot = viewChild<ElementRef<HTMLElement>>('scrollRoot');
    private sentinel = viewChild<ElementRef<HTMLElement>>('sentinel');
    private shownCount = signal(RadialSegmentDetailsComponent.PAGE_SIZE);

    public visibleEvents = computed(() => this.events().slice(0, this.shownCount()));
    public hasMore = computed(() => this.shownCount() < this.events().length);
    public share = computed(() => {
        const { value, groupTotal } = this.segment();
        return groupTotal ? (value / groupTotal * 100).toFixed(1) : '0';
    });

    constructor() {
        // A different segment is a different list — start it from the top again.
        effect(() => {
            this.segment();
            this.events();
            this.shownCount.set(RadialSegmentDetailsComponent.PAGE_SIZE);
        });

        // Reveal the next page once the sentinel below the list is scrolled into view.
        effect(onCleanup => {
            const sentinel = this.sentinel()?.nativeElement;
            if (!sentinel) {
                return;
            }

            const observer = new IntersectionObserver(
                entries => {
                    if (entries.some(entry => entry.isIntersecting)) {
                        this.showNextPage();
                    }
                },
                { root: this.scrollRoot()?.nativeElement ?? null, rootMargin: '80px' }
            );

            observer.observe(sentinel);
            onCleanup(() => observer.disconnect());
        });
    }

    /** VideoLectures search for the event title — see the class comment for why not a direct link. */
    public searchUrl(event: SegmentEvent): string {
        return `${ RadialSegmentDetailsComponent.SEARCH_URL }?query=${ encodeURIComponent(event.title.trim()) }`;
    }

    private showNextPage() {
        this.shownCount.update(shown =>
            Math.min(shown + RadialSegmentDetailsComponent.PAGE_SIZE, this.events().length)
        );
    }
}
