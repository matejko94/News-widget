import { AfterViewInit, DestroyRef, Directive, ElementRef, inject, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, startWith } from 'rxjs/operators';
import { fromResize } from '../../common/utility/from-resize';

@Directive()
export abstract class Chart implements AfterViewInit {
    protected destroyRef = inject(DestroyRef);

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
