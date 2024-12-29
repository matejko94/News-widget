import { Component, computed, input, Signal } from '@angular/core';

@Component({
    selector: 'app-legend',
    template: `
        <ul class="flex flex-col gap-1 mt-4 p-2">
            @for (entry of entries(); track entry.name) {
                <li class="px-3 py-1 w-full text-xs sm:text-base text-center text-white rounded"
                    [style.background-color]="entry.color">
                    {{ entry.name }}
                </li>
            }
        </ul>
    `
})
export class LegendComponent {
    public items = input.required<string[]>();
    public colors = input.required<string[]>();
    public entries: Signal<{name: string, color: string}[]> = computed(() => {
        return this.items().map((item, i) => ({ name: item, color: this.colors()[i] }));
    });
}
