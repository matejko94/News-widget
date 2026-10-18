import { Component, computed, input, output } from '@angular/core';
import { SegmentDocumentDto } from '../../domain/education/types/segment-document.dto';
import { RadialSegmentSelection } from '../../ui/charts/radial-stacked-chart/radial-stacked-chart.component';
import { LectureListComponent } from '../../ui/components/lecture-list/lecture-list.component';

/**
 * Panel shown when a radial segment is clicked: what the segment counts, and the lectures behind
 * it, each linking to its VideoLectures page.
 *
 * Presentational — the page owns the paging and hands down one accumulated list; the list
 * emits `loadMore` when its sentinel scrolls into view.
 */
@Component({
    selector: 'app-radial-segment-details',
    standalone: true,
    imports: [ LectureListComponent ],
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

        <div class="flex-1 overflow-y-auto relative px-2 py-2">
            <app-lecture-list [documents]="documents()" [hasMore]="hasMore()" [loading]="loading()"
                              emptyText="No lectures found for this segment."
                              (loadMore)="loadMore.emit()"/>
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

    public share = computed(() => {
        const { value, groupTotal } = this.segment();
        return groupTotal ? (value / groupTotal * 100).toFixed(1) : '0';
    });
}
