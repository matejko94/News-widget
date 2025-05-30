import { booleanAttribute, Component, inject, Injector, input, OnInit, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Select } from 'primeng/select';
import { map } from 'rxjs';

export interface Option {
    label: string;
    value: string;
}

@Component({
    selector: 'app-menu',
    imports: [ Select, FormsModule ],
    template: `
        <p-select
            [options]="options()" [ngModel]="selected()" (ngModelChange)="onChange($event)"
            optionLabel="label" optionValue="value" appendTo="body" [showClear]="showClear()"
            [placeholder]="label()" class="w-fit min-w-48 max-w-full border border-gray-300"
        />
    `
})
export class MenuComponent implements OnInit {
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private injector = inject(Injector);

    public queryParam = input.required<'topic' | 'region' | 'paramX' | 'paramY' | 'paramZ'>();
    public label = input.required<string>();
    public showClear = input(false, { transform: booleanAttribute });
    public options = input.required<Option[] | undefined>();
    public selected!: Signal<string | undefined>;

    public ngOnInit() {
        this.selected = toSignal(this.route.queryParamMap.pipe(
            map(params => params.get(this.queryParam()) ?? undefined)
        ), { injector: this.injector });
    }

    public onChange(value: string) {
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { [this.queryParam()]: value },
            queryParamsHandling: 'merge'
        });
    }
}
