import { Component, input } from '@angular/core';

export interface LegendItem {
    label: string;
    color: string;
    onClick?: () => void;
    isActive?: () => boolean;
}

@Component({
    selector: 'app-pill-legend',
    template: `
        <ul class="flex flex-wrap md:flex-nowrap md:flex-col gap-1 p-2">
            @for (item of items(); track item.label) {
                <li class="px-3 py-1 w-fit md:w-full md:min-w-max text-[10px] md:text-xs text-center text-white rounded cursor-pointer transition-opacity hover:opacity-80"
                    [class.opacity-50]="item.isActive && !item.isActive()"
                    [style.background-color]="item.color"
                    (click)="item.onClick && item.onClick()">
                    {{ item.label }}
                </li>
            }
        </ul>
    `
})
export class PillLegendComponent {
    public items = input.required<LegendItem[]>();
}
