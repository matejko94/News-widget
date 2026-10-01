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
 * The events are NOT links. The ids /education/whitespace returns (30177, 21273, ...) are legacy
 * VideoLectures ids, while the current site addresses events by slug over its own id space
 * (1..~1600) -- /events/30177 and /30177 both 404, and old.videolectures.net no longer serves
 * (526). Linking to a title search was tried and measured on eight real titles: three landed on
 * the event, five landed on an unrelated list, because the search ORs on single words and ranks
 * by date ("8th International Conference on Mobile and Ubiquitous Multimedia" returns 607 of the
 * ~1600 events). A link that looks like it opens the event and usually does not is worse than no
 * link, so the rows stay plain until the backend hands us a real URL per document.
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
                        <li class="flex items-center h-14 px-2" [title]="event.title.trim()">
                            <span class="text-sm leading-snug text-gray-800 line-clamp-2">
                                {{ event.title.trim() }}
                            </span>
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
           title="The ids /education/whitespace returns are legacy VideoLectures ids; the current site addresses events by slug, so no direct link can be built. A per-lecture list with links needs the endpoint specified in specs/education-documents-endpoint.md.">
            A sample of where this topic and {{ segment().label }} co-occur, not all
            {{ segment().value }} documents. Not linked — VideoLectures cannot be addressed by the
            legacy ids this API returns.
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

    private showNextPage() {
        this.shownCount.update(shown =>
            Math.min(shown + RadialSegmentDetailsComponent.PAGE_SIZE, this.events().length)
        );
    }
}
