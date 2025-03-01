import { AfterViewInit, booleanAttribute, Component, DestroyRef, ElementRef, inject, input, OnDestroy, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { select } from 'd3';
// @ts-ignore
import { sliderBottom } from 'd3-simple-slider';
import { Button } from 'primeng/button';
import { debounceTime, fromEvent, startWith } from 'rxjs';

@Component({
    selector: 'app-year-slider',
    imports: [
        Button
    ],
    styles: `
        :host {
            display: block;
            width: 100%;
        }
    `,
    template: `
        <div class="flex justify-between items-center w-full px-6 pt-4">
            <div>Year:</div>
            <p-button [label]="interval !== undefined ? 'Stop' : 'Continue'" (click)="toggleAutoIncrement()"/>
        </div>
        <div #slider id="slider" class="w-full overflow-hidden"></div>
    `
})
export class YearSliderComponent implements AfterViewInit, OnDestroy {
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private destroyRef = inject(DestroyRef);

    public sliderEl = viewChild.required<ElementRef<HTMLDivElement>>('slider');
    public autoIncrement = input(false, { transform: booleanAttribute });
    public autoDelay = input(2500);
    public min = input.required<number>();
    public max = input.required<number>();
    public interval: number | undefined;
    private slider: any;

    public ngAfterViewInit() {
        fromEvent(window, 'resize').pipe(
            debounceTime(25),
            startWith(null),
            takeUntilDestroyed(this.destroyRef),
        ).subscribe(() => this.render());

        setTimeout(() => this.render(), 0);
    }

    public ngOnDestroy() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }

    private render() {
        if (this.interval) {
            clearInterval(this.interval);
        }

        const container = this.sliderEl().nativeElement;
        container.innerHTML = '';
        const { width } = container.getBoundingClientRect();

        this.slider = sliderBottom()
            .ticks(6)
            .min(this.min())
            .max(this.max())
            .step(1)
            .width(width - 60)
            .displayValue(true)
            .tickFormat((d: number) => d.toString())
            .on('onchange', (year: number) => {
                this.router.navigate([], {
                    relativeTo: this.route,
                    queryParams: { year },
                    queryParamsHandling: 'merge'
                });
            });

        select(container)
            .append('svg')
            .attr('width', width)
            .attr('height', 90)
            .append('g')
            .attr('transform', 'translate(30,30)')
            .call(this.slider);

        if (this.autoIncrement()) {
            this.startAutoIncrement();
        }
    }

    public toggleAutoIncrement() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = undefined;
        } else {
            this.startAutoIncrement();
        }
    }

    private startAutoIncrement() {
        this.interval = setInterval(() => {
            const nextYear = this.slider.value() + 1;
            this.slider.value(nextYear > this.max() ? this.min() : nextYear);
        }, this.autoDelay());
    }
}
