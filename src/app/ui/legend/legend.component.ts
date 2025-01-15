import { booleanAttribute, Component, computed, input, Signal } from '@angular/core';

@Component({
    selector: 'app-legend',
    template: `
        <ul class="flex flex-wrap md:flex-nowrap md:flex-col gap-1 p-2">
            @for (entry of entries(); track entry.name) {
                <li class="px-3 py-1 w-fit md:w-full md:min-w-max text-[10px] md:text-xs text-center text-white rounded"
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
    public horizontal = input(false, { transform: booleanAttribute });
}
