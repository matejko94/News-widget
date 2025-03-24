import { Component, inject, Injector, input, OnInit, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MultiSelect } from 'primeng/multiselect';
import { map } from 'rxjs';

export interface Option {
    label: string;
    value: string;
}

@Component({
    selector: 'app-multi-menu',
    standalone: true,
    imports: [ MultiSelect, FormsModule ],
    styles: `
        :host {
            display: block;
            width: fit-content;
        }
    `,
    template: `
        <p-multiSelect
            [options]="options()" [ngModel]="selected()" (ngModelChange)="onChange($event)"
            optionLabel="label" optionValue="value" [maxSelectedLabels]="2" [filter]="false"
            [placeholder]="label()" display="chip" class="w-80 border border-gray-300"
            [showToggleAll]="false" [showClear]="true" appendTo="body"
        />
    `
})
export class MultiMenuComponent implements OnInit {
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private injector = inject(Injector);

    public queryParam = input.required<string>();
    public label = input.required<string>();
    public options = input.required<Option[]>();
    public selected!: Signal<string[] | undefined>;

    public ngOnInit() {
        this.selected = toSignal(
            this.route.queryParamMap.pipe(
                map(params => (params.get(this.queryParam())?.split(',') ?? []).filter(v => !!v.trim()))
            ),
            { injector: this.injector }
        );
    }

    public onChange(values: string[]) {
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {
                [this.queryParam()]: values?.length ? values.join(',') : null
            },
            queryParamsHandling: 'merge'
        });
    }
}
