import { AfterViewInit, Component, DestroyRef, ElementRef, inject, input, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { axisBottom, axisLeft, ScaleBand, scaleBand, ScaleLinear, scaleLinear, select, Selection } from 'd3';
import { debounceTime, startWith } from 'rxjs/operators';
import { fromResize } from '../../../common/utility/from-resize';

export interface LollipopChartData {
    xValue: number;
    yValue: string;
}

@Component({
    selector: 'app-lollipop-chart',
    styles: [ `
        :host {
            display: flex;
            justify-items: center;
            align-items: center;
            flex-direction: column;
            width: 100%;
            padding-left: 3rem;
            overflow: hidden;

            ::ng-deep {
                svg {
                    overflow: visible;
                }

                .label {
                    font-size: 12px;

                    @media (max-width: 768px) {
                        font-size: 11px;
                    }

                    @media (max-width: 640px) {
                        font-size: 10px;
                    }

                    @media (max-width: 480px) {
                        font-size: 9px;
                    }
                }
            }
        }

        .tooltip {
            position: absolute;
            text-align: center;
            width: auto;
            height: auto;
            padding: 10px;
            font: 12px sans-serif;
            background: black;
            border: 0px;
            border-radius: 5px;
            pointer-events: none;
            color: white;
        }
    ` ],
    template: `
        <div #chartContainer class="w-full h-full"></div>`
})
export class LineChartComponent implements AfterViewInit {
    private destroyRef = inject(DestroyRef);

    private chartContainer = viewChild.required<ElementRef>('chartContainer');
    public data = input.required<LollipopChartData[]>();

    private margin = { top: 10, right: 30, bottom: 40, left: 100 };
    private svg!: Selection<SVGSVGElement, unknown, null, undefined>;
    private tooltip!: Selection<HTMLDivElement, unknown, null, undefined>;
    private x!: ScaleLinear<number, number>;
    private y!: ScaleBand<string>;

    public ngAfterViewInit(): void {
        fromResize(this.chartContainer().nativeElement).pipe(
            debounceTime(10),
            startWith(null),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe(() => this.renderChart());
    }

    private renderChart(): void {
        if (!this.data().length) return;

        const container = this.chartContainer().nativeElement;
        const { height, width } = container.getBoundingClientRect();
        const size = Math.min(height, width) * 0.95;

        this.clearChart(container);
        this.createSvg(container, size);
        this.createScales(size);
        this.createAxes(size);
        this.createTooltip(container);
        this.createLines();
        this.createCircles();
    }

    private clearChart(container: HTMLElement): void {
        container.innerHTML = '';
    }

    private createSvg(container: HTMLElement, size: number): void {
        this.svg = select(container)
            .append('svg')
            .attr('width', size + this.margin.left + this.margin.right)
            .attr('height', size + this.margin.top + this.margin.bottom);

        this.svg.append('g')
            .attr('transform', `translate(${ this.margin.left },${ this.margin.top })`);
    }

    private createScales(size: number): void {
        this.x = scaleLinear().domain([ 0, Math.max(...this.data().map(d => d.xValue)) ]).range([ 0, size ]);
        this.y = scaleBand().range([ 0, size ]).domain(this.data().map(d => d.yValue)).padding(1);
    }

    private createAxes(size: number): void {
        this.svg.append('g')
            .attr('transform', `translate(0, ${ size })`)
            .call(axisBottom(this.x))
            .selectAll('text')
            .attr('class', 'label')
            .attr('transform', 'translate(-10,0)rotate(-45)')
            .style('text-anchor', 'end');

        this.svg.append('g')
            .call(axisLeft(this.y));
    }

    private createTooltip(container: HTMLElement): void {
        this.tooltip = select(container)
            .append('div')
            .attr('class', 'tooltip')
            .style('opacity', 0);
    }

    private createLines(): void {
        this.svg.selectAll('myline')
            .data(this.data())
            .enter()
            .append('line')
            .attr('x1', d => this.x(d.xValue))
            .attr('x2', this.x(0))
            .attr('y1', d => this.y(d.yValue)!)
            .attr('y2', d => this.y(d.yValue)!)
            .attr('stroke', 'grey');
    }

    private createCircles(): void {
        const showTooltip = (event: any, d: LollipopChartData) => {
            this.tooltip.transition().duration(200).style('opacity', 1);
            this.tooltip.html(`${ d.yValue }<br>Value: ${ d.xValue }`)
                .style('left', `${ event.pageX + 30 }px`)
                .style('top', `${ event.pageY + 30 }px`);
        };

        const moveTooltip = (event: any) => {
            this.tooltip
                .style('left', `${ event.pageX + 15 }px`)
                .style('top', `${ event.pageY + 15 }px`);
        };

        const hideTooltip = () => {
            this.tooltip.transition().duration(200).style('opacity', 0);
        };

        this.svg.selectAll('mycircle')
            .data(this.data())
            .enter()
            .append('circle')
            .attr('cx', d => this.x(d.xValue))
            .attr('cy', d => this.y(d.yValue)!)
            .attr('r', 4)
            .style('fill', '#69b3a2')
            .attr('stroke', 'black')
            .on('mouseover', showTooltip)
            .on('mousemove', moveTooltip)
            .on('mouseleave', hideTooltip);
    }
}
