import { Component, inject, input, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Select } from 'primeng/select';
import { map } from 'rxjs';

@Component({
    selector: 'app-topic-menu',
    imports: [ Select, FormsModule ],
    template: `
        <p-select
            [options]="options()"
            [ngModel]="selected()" (ngModelChange)="onChange($event)"
            placeholder="Select topic" class="w-48 border border-gray-300"
        />
    `
})
export class TopicMenuComponent {
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    public options = input.required<string[] | undefined>();
    public selected: Signal<string | undefined>;

    constructor() {
        this.selected = toSignal(this.route.queryParamMap.pipe(
            map(params => params.get('topic') ?? undefined)
        ))
    }

    public onChange(topic: string) {
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { topic },
            queryParamsHandling: 'merge'
        });
    }
}
