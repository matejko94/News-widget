import { Component, computed, input, output } from '@angular/core';
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
 * The per-lecture list — the Event Registry-style "here are the documents" view — needs a
 * backend endpoint that does not exist yet (see specs/education-documents-endpoint.md). Until
 * it lands, the panel shows the counts the chart already has plus the events from
 * /education/whitespace, and says so rather than pretending the list is complete.
 */
@Component({
    selector: 'app-radial-segment-details',
    standalone: true,
    imports: [ SpinnerComponent ],
    template: `
        <div class="flex items-start gap-2 p-3 border-b">
            <!-- Topic above the key, so a long OER action-area name doesn't squeeze the title. -->
            <div class="flex-1 min-w-0">
                <h2 class="font-semibold text-lg leading-tight">{{ segment().groupLabel }}</h2>
                <span class="inline-block mt-1 rounded px-2 py-0.5 text-sm font-semibold text-white"
                      [style.background-color]="color()">{{ segment().label }}</span>
            </div>
            <button type="button" aria-label="Close"
                    class="shrink-0 w-7 h-7 rounded text-gray-500 hover:bg-gray-100 text-xl leading-none"
                    (click)="close.emit()">&times;
            </button>
        </div>

        <div class="p-3 border-b">
            <div class="text-3xl font-bold">{{ segment().value }}</div>
            <div class="text-gray-600">documents in <b>{{ segment().groupLabel }}</b> classified as
                <b>{{ segment().label }}</b> — {{ share() }}% of this topic's bar
            </div>
            <p class="mt-2 text-sm text-gray-500">
                Counts come from the education index (video lectures), not from news. A lecture can
                be classified into several SDGs, so it may be counted in more than one segment of
                the same bar.
            </p>
        </div>

        <div class="flex-1 overflow-y-auto p-3 relative">
            <h3 class="font-semibold mb-2">Events this material comes from</h3>

            @if (loading()) {
                <div class="h-24"><app-spinner/></div>
            } @else if (events().length) {
                <ul class="flex flex-col gap-2">
                    @for (event of events(); track event.id) {
                        <li class="border-b pb-2 text-sm">{{ event.title }}</li>
                    }
                </ul>
            } @else {
                <div class="text-gray-500 text-sm">No events found for this segment.</div>
            }
        </div>

        <p class="p-3 border-t text-xs text-gray-500">
            A per-lecture list with links needs a new backend endpoint — see
            <code>specs/education-documents-endpoint.md</code>. The events above are a sample of
            where this topic and {{ segment().label }} co-occur, not the full {{ segment().value }}
            documents.
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
    public events = input.required<SegmentEvent[]>();
    public loading = input.required<boolean>();
    public color = input<string>('#6B7280');
    public close = output<void>();

    public share = computed(() => {
        const { value, groupTotal } = this.segment();
        return groupTotal ? (value / groupTotal * 100).toFixed(1) : '0';
    });
}
