import { Component, input } from '@angular/core';
import { axisBottom, axisLeft, ScaleBand, scaleBand, ScaleLinear, scaleLinear, select, Selection } from 'd3';
import { Chart } from '../chart.abstract';
import { createTooltip, registerTooltip } from '../tooltip/tooltip';

export interface LollipopChartData {
    xValue: number;
    yValue: string;
}

@Component({
    selector: 'app-lollipop-chart',
    styles: [ `
        :host {
            display: block;
            width: 100%;
            overflow: hidden;
            padding-left: 3.5rem;
            padding-right: 1.5rem;

            ::ng-deep {
                svg {
                    overflow: visible;
                }

                .tick {
                    font-size: 14px;

                    @media (max-width: 640px) {
                        font-size: 12px;
                    }

                    @media (max-width: 480px) {
                        font-size: 10px;
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
        <div class="flex flex-col justify-center items-center w-full h-full relative">
            <div #chartContainer class="w-full h-full flex flex-col items-center"></div>
        </div>
    `
})
export class LollipopChartComponent extends Chart {
    public data = input.required<LollipopChartData[]>();
    private svg!: Selection<SVGSVGElement, unknown, null, undefined>;
    private x!: ScaleLinear<number, number>;
    private y!: ScaleBand<string>;

    protected override renderChart(): void {
        if (!this.data().length) return;

        const container = this.chartContainer().nativeElement;
        const { height, width } = container.getBoundingClientRect();
        const size = Math.min(height, width) * 0.95;

        this.clearChart(container);
        this.createSvg(container, size);
        this.createScales(size);
        this.createAxes(size);
        this.createLines();
        this.createCircles(container);
    }

    private clearChart(container: HTMLElement): void {
        container.innerHTML = '';
    }

    private createSvg(container: HTMLElement, size: number): void {
        this.svg = select(container)
            .append('svg')
            .attr('width', size)
            .attr('height', size);

        this.svg.append('g')
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

    private createCircles(container: HTMLElement): void {
        const tooltip = createTooltip(container);
        const circles = this.svg.selectAll('mycircle')
            .data(this.data())
            .enter()
            .append('circle')
            .attr('cx', d => this.x(d.xValue))
            .attr('cy', d => this.y(d.yValue)!)
            .attr('r', 4)
            .style('fill', '#69b3a2')
            .attr('stroke', 'black');

        registerTooltip(circles, tooltip, container, (d: LollipopChartData) => `${ d.yValue }<br>Value: ${ d.xValue }`);
    }
}
