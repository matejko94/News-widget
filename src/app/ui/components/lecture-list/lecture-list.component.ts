import { Component, effect, ElementRef, input, output, viewChild } from '@angular/core';
import { SegmentDocumentDto } from '../../../domain/education/types/segment-document.dto';
import { SpinnerComponent } from '../spinner/spinner.component';

/**
 * A list of VideoLectures lectures, each row linking to its lecture page. Shared by the radial
 * segment panel and the Links event panel.
 *
 * Presentational: the owner does the paging and passes in one accumulated list. This component
 * emits `loadMore` when the sentinel below the list scrolls into view. The observer uses the
 * viewport as its root, which also respects any scrolling ancestor, so the list works inside
 * whichever container scrolls it.
 */
@Component({
    selector: 'app-lecture-list',
    standalone: true,
    imports: [ SpinnerComponent ],
    template: `
        @if (loading() && !documents().length) {
            <div class="h-28"><app-spinner/></div>
        } @else if (documents().length) {
            <ul>
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
            <div class="px-2 py-4 text-sm text-gray-500">{{ emptyText() }}</div>
        }
    `,
    styles: `
        :host {
            display: block;
        }

        .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
    `
})
export class LectureListComponent {
    public documents = input.required<SegmentDocumentDto[]>();
    public hasMore = input.required<boolean>();
    public loading = input.required<boolean>();
    public emptyText = input('No lectures found.');
    // Leave the event out of each row's meta line when the whole list is from one event.
    public showEvent = input(true);
    public loadMore = output<void>();

    private sentinel = viewChild<ElementRef<HTMLElement>>('sentinel');

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
                { rootMargin: '80px' }
            );

            observer.observe(sentinel);
            onCleanup(() => observer.disconnect());
        });
    }

    /** "Event title · 2 Jun 2023 · 1:08:08": whichever parts the document has. */
    public meta(document: SegmentDocumentDto): string {
        return [
            this.showEvent() ? document.event_title?.trim() : null,
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
