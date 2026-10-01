import { Component, computed, effect, ElementRef, input, output, viewChild } from '@angular/core';
import { SegmentDocumentDto } from '../../domain/education/types/segment-document.dto';
import { RadialSegmentSelection } from '../../ui/charts/radial-stacked-chart/radial-stacked-chart.component';
import { SpinnerComponent } from '../../ui/components/spinner/spinner.component';

/**
 * Panel shown when a radial segment is clicked: what the segment counts, and the lectures behind
 * it, each linking to its VideoLectures page.
 *
 * Presentational — the page owns the paging and hands down one accumulated list; this emits
 * `loadMore` when the sentinel below the list scrolls into view.
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
                <span class="text-sm font-medium text-gray-500">lectures · {{ share() }}% of the bar</span>
            </div>
            <p class="mt-1.5 text-sm text-gray-600">
                Video lectures in <b>{{ segment().groupLabel }}</b> classified as <b>{{ segment().label }}</b>.
            </p>
            <p class="mt-2 text-xs leading-relaxed text-gray-500">
                A lecture can be classified into several SDGs, so it may be counted in more than one
                segment of the same bar.
            </p>
        </div>

        <div #scrollRoot class="flex-1 overflow-y-auto relative">
            @if (loading() && !documents().length) {
                <div class="h-28"><app-spinner/></div>
            } @else if (documents().length) {
                <ul class="px-2 py-2">
                    @for (document of documents(); track document.id) {
                        <li>
                            <a class="group flex items-center gap-2 h-[4.5rem] px-2 rounded-lg
                                      hover:bg-gray-100 transition-colors"
                               [href]="document.url" target="_blank" rel="noopener noreferrer"
                               [title]="document.title.trim()">
                                <span class="flex-1 min-w-0">
                                    <span class="block text-sm leading-snug text-gray-800 line-clamp-2">
                                        {{ document.title.trim() }}
                                    </span>
                                    <span class="block mt-0.5 text-xs text-gray-500 truncate">{{ meta(document) }}</span>
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
                <div class="px-4 py-6 text-sm text-gray-500">No lectures found for this segment.</div>
            }
        </div>

        <p class="px-4 py-2 border-t border-gray-200 text-[11px] leading-snug text-gray-500">
            Showing {{ documents().length }} of {{ total() }}. Opens on VideoLectures.
            @if (excluded()) {
                {{ excluded() }} without a title or link are not listed.
            }
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
    public segment = input.required<RadialSegmentSelection>();
    public documents = input.required<SegmentDocumentDto[]>();
    public total = input.required<number>();
    public hasMore = input.required<boolean>();
    public loading = input.required<boolean>();
    public excluded = input<number>(0);
    public color = input<string>('#6B7280');
    public close = output<void>();
    public loadMore = output<void>();

    private scrollRoot = viewChild<ElementRef<HTMLElement>>('scrollRoot');
    private sentinel = viewChild<ElementRef<HTMLElement>>('sentinel');

    public share = computed(() => {
        const { value, groupTotal } = this.segment();
        return groupTotal ? (value / groupTotal * 100).toFixed(1) : '0';
    });

    constructor() {
        // Ask for the next page once the sentinel below the list is scrolled into view.
        effect(onCleanup => {
            const sentinel = this.sentinel()?.nativeElement;
            if (!sentinel) {
                return;
            }

            const observer = new IntersectionObserver(
                entries => {
                    if (entries.some(entry => entry.isIntersecting)) {
                        this.loadMore.emit();
                    }
                },
                { root: this.scrollRoot()?.nativeElement ?? null, rootMargin: '80px' }
            );

            observer.observe(sentinel);
            onCleanup(() => observer.disconnect());
        });
    }

    /** "Event title · 2 Jun 2023 · 1:08:08" — whichever parts the document has. */
    public meta(document: SegmentDocumentDto): string {
        return [
            document.event_title?.trim(),
            document.date ? new Date(document.date).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'short', year: 'numeric'
            }) : null,
            this.formatDuration(document.duration)
        ].filter(Boolean).join(' · ');
    }

    private formatDuration(seconds: number | null | undefined): string | null {
        if (!seconds) {
            return null;
        }

        const parts = [ Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, Math.floor(seconds) % 60 ];
        return (parts[0] ? parts : parts.slice(1))
            .map((part, index) => index === 0 ? part.toString() : part.toString().padStart(2, '0'))
            .join(':');
    }
}
