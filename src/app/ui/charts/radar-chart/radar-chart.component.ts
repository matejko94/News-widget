import { Component, input } from '@angular/core';
import { curveLinearClosed, line, scaleLinear, select, Selection } from 'd3';
import { Chart } from '../chart.abstract';
import { createTooltip, registerTooltip } from '../tooltip/tooltip';

export interface RadarChartData {
    axis: string;
    value: number;
}

@Component({
    selector: 'app-radar-chart',
    styles: [ `
        :host {
            display: flex;
            justify-items: center;
            align-items: center;
            flex-direction: column;
            width: 100%;

            ::ng-deep {
                svg {
                    overflow: visible;
                }

                .label {
                    font-size: 14px;

                    @media (max-width: 640px) {
                        font-size: 12px;
                    }

                    @media (max-width: 480px) {
                        font-size: 11px;
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
            border: 0;
            border-radius: 5px;
            pointer-events: none;
            color: white;
        }
    ` ],
    template: `
        <div class="flex flex-col justify-center items-center aspect-square w-full h-full relative">
            <div #chartContainer class="w-full h-full flex flex-col items-center"></div>
        </div>
    `
})
export class RadarChartComponent extends Chart {
    public data = input.required<RadarChartData[]>();
    private margin = { top: 50, right: 75, bottom: 50, left: 75 };
    private svg!: Selection<SVGSVGElement, unknown, null, undefined>;
    private tooltip!: Selection<HTMLDivElement, unknown, null, undefined>;
    private radius = 0;
    private angleSlice = 0;
    private rScale!: ReturnType<typeof scaleLinear>;
    private chartGroup!: Selection<SVGGElement, unknown, null, undefined>;

    protected override renderChart(): void {
        if (!this.data().length) return;

        const container = this.chartContainer().nativeElement;
        const { height, width } = container.getBoundingClientRect();
        const size = Math.min(height, width) * 0.75;

        this.clearChart(container);
        this.createSvg(container, size);
        this.createScales(size);
        this.createAxes();
        this.tooltip = createTooltip(container);
        this.createRadarArea();
        this.createDots(container);
    }

    private clearChart(container: HTMLElement): void {
        container.innerHTML = '';
    }

    private createSvg(container: HTMLElement, size: number): void {
        this.svg = select(container)
            .append('svg')
            .attr('width', size + this.margin.left + this.margin.right)
            .attr('height', size + this.margin.top + this.margin.bottom);

        this.chartGroup = this.svg
            .append('g')
            .attr(
                'transform',
                `translate(${ (size / 2) + this.margin.left }, ${ (size / 2) + this.margin.top })`
            );
    }

    private createScales(size: number): void {
        const maxValue = Math.max(...this.data().map(d => d.value));
        this.radius = size / 2;
        this.angleSlice = (Math.PI * 2) / this.data().length;

        this.rScale = scaleLinear()
            .range([ 0, this.radius ])
            .domain([ 0, maxValue ]);
    }

    private createAxes(): void {
        const axisGrid = this.chartGroup
            .append('g')
            .attr('class', 'axisWrapper');

        axisGrid.selectAll('.levels')
            .data([ 1, 2, 3, 4, 5 ])
            .enter()
            .append('circle')
            .attr('class', 'gridCircle')
            .attr('r', d => this.radius / 5 * d)
            .style('fill', '#CDCDCD')
            .style('stroke', '#CDCDCD')
            .style('fill-opacity', 0.1);

        const axis = axisGrid.selectAll('.axis')
            .data(this.data())
            .enter()
            .append('g')
            .attr('class', 'axis');

        axis.append('line')
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', (d, i) => this.rScale(Math.max(...this.data().map(d => d.value))) as number * Math.cos(this.angleSlice * i - Math.PI / 2))
            .attr('y2', (d, i) => this.rScale(Math.max(...this.data().map(d => d.value))) as number * Math.sin(this.angleSlice * i - Math.PI / 2))
            .attr('class', 'line')
            .style('stroke', 'white')
            .style('stroke-width', '2px');

        axis.append('text')
            .attr('class', 'legend')
            .attr('text-anchor', 'middle')
            .attr('dy', '0.35em')
            .attr('x', (d, i) => this.rScale(Math.max(...this.data().map(d => d.value)) * 1.2) as number * Math.cos(this.angleSlice * i - Math.PI / 2))
            .attr('y', (d, i) => this.rScale(Math.max(...this.data().map(d => d.value)) * 1.1) as number * Math.sin(this.angleSlice * i - Math.PI / 2))
            .attr('class', 'label')
            .text(d => d.axis);

        axisGrid.selectAll('.radialLabel')
            .data(this.rScale.ticks(5))
            .enter()
            .append('text')
            .attr('class', 'radialLabel')
            .attr('x', 0)
            .attr('y', d => -(this.rScale(d) as number))
            .attr('dy', '-0.4em')
            .style('text-anchor', 'middle')
            .style('font-size', '10px')
            .text(d => d);
    }

    private createRadarArea(): void {
        const radarLine = line<RadarChartData>()
            .x((d, i) => this.rScale(d.value)! as number * Math.cos(this.angleSlice * i - Math.PI / 2))
            .y((d, i) => this.rScale(d.value)! as number * Math.sin(this.angleSlice * i - Math.PI / 2))
            .curve(curveLinearClosed);

        this.chartGroup
            .append('path')
            .datum(this.data())
            .attr('d', radarLine)
            .style('fill', '#69b3a2')
            .style('fill-opacity', 0.5)
            .style('stroke', '#69b3a2')
            .style('stroke-width', '2px');
    }

    private createDots(container: HTMLElement): void {
        const circles = this.chartGroup
            .selectAll('.radarCircle')
            .data(this.data())
            .enter()
            .append('circle')
            .attr('class', 'radarCircle')
            .attr('r', 5)
            .attr('cx', (d, i) => this.rScale(d.value)! as number * Math.cos(this.angleSlice * i - Math.PI / 2))
            .attr('cy', (d, i) => this.rScale(d.value)! as number * Math.sin(this.angleSlice * i - Math.PI / 2))
            .style('fill', '#69b3a2')
            .style('fill-opacity', 0.8);

        registerTooltip(circles, this.tooltip, container, (d) => {
            return `<strong>${ d.axis }</strong><br/>Value: ${ d.value }`;
        });
    }
}
