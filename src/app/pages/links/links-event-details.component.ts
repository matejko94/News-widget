import { Component, computed, input, output } from '@angular/core';
import { EventDto } from '../../domain/education/types/event-sdgs.dto';

/**
 * Panel shown when a node in the Links graph is clicked: the event's title, date and description,
 * and a link to it on VideoLectures.
 *
 * Date, description and link come from /education/whitespace and each may be null (most events
 * have no description), so each part renders only when present. The link is never built on the
 * frontend: the ids are legacy VideoLectures ids (see specs/education-documents-endpoint.md).
 */
@Component({
    selector: 'app-links-event-details',
    standalone: true,
    template: `
        <header class="flex items-start gap-3 px-4 py-3 border-b border-gray-200">
            <div class="flex-1 min-w-0">
                <h2 class="font-semibold text-lg leading-tight text-gray-900 line-clamp-3" [title]="title()">
                    {{ title() }}
                </h2>
                @if (date(); as date) {
                    <span class="block mt-1 text-sm text-gray-500">{{ date }}</span>
                }
            </div>
            <button type="button" aria-label="Close"
                    class="shrink-0 w-8 h-8 -mr-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100
                           transition-colors text-2xl leading-none flex items-center justify-center"
                    (click)="close.emit()">&times;
            </button>
        </header>

        <div class="flex-1 overflow-y-auto px-4 py-3">
            @if (event().description?.trim(); as description) {
                <p class="text-sm leading-relaxed text-gray-700 whitespace-pre-line">{{ description }}</p>
            }

            <p class="mt-3 first:mt-0 flex items-center gap-2 text-sm text-gray-600">
                <span class="inline-block w-2.5 h-2.5 rounded-full" [style.background-color]="color()"></span>
                Linked to <b class="tabular-nums">{{ connections() }}</b>
                {{ connections() === 1 ? 'other event' : 'other events' }} by shared SDGs.
            </p>
        </div>

        @if (event().url; as url) {
            <a class="flex items-center justify-center gap-2 m-3 px-4 py-2 rounded-lg text-sm font-semibold
                      text-white hover:opacity-90 transition-opacity"
               [style.background-color]="color()"
               [href]="url" target="_blank" rel="noopener noreferrer">
                Visit on VideoLectures
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                     stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/>
                    <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
            </a>
        } @else {
            <p class="px-4 py-2 border-t border-gray-200 text-[11px] leading-snug text-gray-500">
                This event has no page on VideoLectures.
            </p>
        }
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            background: #fff;
        }

        .line-clamp-3 {
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
    `
})
export class LinksEventDetailsComponent {
    public event = input.required<EventDto>();
    public connections = input.required<number>();
    public color = input<string>('#6B7280');
    public close = output<void>();

    public title = computed(() => (this.event().title ?? '').trim());

    public date = computed(() => {
        const date = this.event().date;
        return date ? new Date(date).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric'
        }) : null;
    });
}
