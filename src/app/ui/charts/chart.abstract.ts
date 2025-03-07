import { AfterViewInit, DestroyRef, Directive, effect, ElementRef, inject, InputSignal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, startWith } from 'rxjs/operators';
import { fromResize } from '../../common/utility/from-resize';

@Directive()
export abstract class Chart<T> implements AfterViewInit {
    protected destroyRef = inject(DestroyRef);

    public abstract data: InputSignal<T>;

    constructor() {
        effect(() => {
            this.data();
            this.renderChart();
        });
    }

    protected chartContainer = viewChild.required<ElementRef<HTMLElement>>('chartContainer');

    public ngAfterViewInit(): void {
        fromResize(this.chartContainer().nativeElement).pipe(
            debounceTime(10),
            startWith(null),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe(() => this.renderChart());
    }

    protected abstract renderChart(): void;
}
