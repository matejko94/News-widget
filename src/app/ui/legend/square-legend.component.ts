import { NgStyle } from '@angular/common';
import { booleanAttribute, Component, input, WritableSignal } from '@angular/core';

interface LegendItem {
    label: string;
    color: string;
    hidden: WritableSignal<boolean>;
}

@Component({
    selector: 'app-box-legend',
    imports: [ NgStyle ],
    template: `
        <ul class="flex flex-wrap gap-1 p-2 {{ !horizontal() ? 'md:flex-nowrap md:flex-col' : '' }}">
            @for (item of items(); track item) {
                <li class="flex items-center text-xs md:text-sm
                    {{ toggleable() ? 'cursor-pointer' : 'pointer-events-none' }}" (click)="toggle(item)">
                        <span class="w-2.5 md:w-3.5 aspect-square mr-1 md:mr-2 rounded"
                              [ngStyle]="{ 'background': item.color }"></span>
                    <span class="{{ item.hidden() ? 'line-through' : '' }}">{{ item.label }}</span>
                </li>
            }
        </ul>

    `
})
export class BoxLegendComponent {
    public items = input.required<LegendItem[]>();
    public horizontal = input(false, { transform: booleanAttribute });
    public toggleable = input(false, { transform: booleanAttribute });

    public toggle(item: LegendItem): void {
        if (this.toggleable()) {
            item.hidden.set(!item.hidden());
        }
    }
}
