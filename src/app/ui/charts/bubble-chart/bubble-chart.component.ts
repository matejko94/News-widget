import { Component, input } from '@angular/core';
import { axisBottom, axisLeft, ScaleLinear, scaleLinear, select, Selection } from 'd3';
import { Chart } from '../chart.abstract';
import { createTooltip, registerTooltip } from '../tooltip/tooltip';

export interface BubbleChartData {
    xValue: number;
    yValue: number;
    radius: number;
    country: string;
    color: string;
}

@Component({
    selector: 'app-bubble-chart',
    styles: [ `
        :host {
            display: block;
            width: 100%;
            aspect-ratio: 2/1;

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
            border: 0;
            border-radius: 5px;
            pointer-events: none;
            color: white;
        }
    ` ],
    template: `
        <div class="flex justify-center items-center h-full w-full pl-10 pt-10">
            <div #chartContainer class="relative h-full w-full"></div>
        </div>
    `,
})
export class BubbleChartComponent extends Chart<BubbleChartData[]> {
    public data = input.required<BubbleChartData[]>();
    public xAxisLabel = input.required<string>();
    public yAxisLabel = input.required<string>();
    public zAxisLabel = input.required<string>();

    private margin = { top: 10, right: 20, bottom: 30, left: 10 };
    private svg!: Selection<SVGSVGElement, unknown, null, undefined>;
    private tooltip!: Selection<HTMLDivElement, unknown, null, undefined>;

    protected override renderChart(): void {
        const container = this.chartContainer().nativeElement;

        const { width, height } = container.getBoundingClientRect();
        const chartWidth = width - this.margin.left - this.margin.right;
        const chartHeight = height - this.margin.top - this.margin.bottom;

        this.createSvg(container, width, height);
        const { xScale, yScale, zScale } = this.prepareScales(chartWidth, chartHeight);
        this.createAxes(xScale, yScale, chartHeight);
        this.updateBubbles(xScale, yScale, zScale);
        this.updateLabels(xScale, yScale, zScale);
        this.addChartTooltip(container);
    }

    private createSvg(container: HTMLElement, width: number, height: number): void {
        this.svg = select(container).select<SVGSVGElement>('svg').node()
            ? select(container).select<SVGSVGElement>('svg')
            : select(container).append('svg');

        this.svg
            .attr('width', width)
            .attr('height', height);
        this.svg
            .append('g')
            .attr('transform', `translate(${ this.margin.left }, ${ this.margin.top })`);
    }

    private prepareScales(chartWidth: number, chartHeight: number) {
        const xMax = Math.max(...this.data().map(d => d.xValue));
        const yMin = Math.min(...this.data().map(d => d.yValue));
        const yMax = Math.max(...this.data().map(d => d.yValue));
        const rMin = Math.min(...this.data().map(d => d.radius));
        const rMax = Math.max(...this.data().map(d => d.radius));

        const xScale = scaleLinear()
            .domain([ 0, xMax ])
            .range([ 0, chartWidth ]);

        const yScale = scaleLinear()
            .domain([ yMin, yMax ])
            .range([ chartHeight, 0 ]);

        const zScale = scaleLinear()
            .domain([ rMin, rMax ])
            .range([ 4, 40 ]);

        return { xScale, yScale, zScale };
    }

    private createAxes(xScale: ScaleLinear<number, number>, yScale: ScaleLinear<number, number>, chartHeight: number) {
        const xAxisGroup = this.svg.select<SVGGElement>('g.x-axis').node()
            ? this.svg.select<SVGGElement>('g.x-axis')
            : this.svg.append('g').attr('class', 'x-axis');

        xAxisGroup
            .attr('transform', `translate(0, ${ chartHeight })`)
            .call(axisBottom(xScale));

        const yAxisGroup = this.svg.select<SVGGElement>('g.y-axis').node()
            ? this.svg.select<SVGGElement>('g.y-axis')
            : this.svg.append('g').attr('class', 'y-axis');

        yAxisGroup.call(axisLeft(yScale));
    }

    private updateBubbles(
        xScale: ScaleLinear<number, number>,
        yScale: ScaleLinear<number, number>,
        zScale: ScaleLinear<number, number>
    ) {
        const bubbles = this.svg
            .selectAll<SVGCircleElement, BubbleChartData>('circle')
            .data(this.data(), (d: BubbleChartData) => d.country);

        bubbles
            .enter()
            .append('circle')
            .attr('fill', d => d.color)
            .attr('r', 0)
            .attr('cx', d => xScale(d.xValue))
            .attr('cy', d => yScale(d.yValue))
            .merge(bubbles)
            .transition()
            .duration(750)
            .attr('cx', d => xScale(d.xValue))
            .attr('cy', d => yScale(d.yValue))
            .attr('r', d => zScale(d.radius))
            .attr('fill', d => d.color);

        bubbles
            .exit()
            .transition()
            .duration(500)
            .attr('r', 0)
            .remove();
    }

    private updateLabels(
        xScale: ScaleLinear<number, number>,
        yScale: ScaleLinear<number, number>,
        zScale: ScaleLinear<number, number>
    ) {
        const labels = this.svg
            .selectAll<SVGTextElement, BubbleChartData>('text.country-label')
            .data(this.data(), (d: BubbleChartData) => d.country);

        labels
            .enter()
            .append('text')
            .attr('class', 'country-label')
            .attr('text-anchor', 'middle')
            .attr('x', d => xScale(d.xValue))
            .attr('y', d => yScale(d.yValue) - zScale(d.radius) - 5)
            .merge(labels)
            .transition()
            .duration(750)
            .attr('x', d => xScale(d.xValue))
            .attr('y', d => yScale(d.yValue) - zScale(d.radius) - 5)
            .text(d => d.country);

        labels
            .exit()
            .transition()
            .duration(500)
            .style('opacity', 0)
            .remove();
    }

    private addChartTooltip(container: HTMLElement) {
        const circles = this.svg.selectAll<SVGCircleElement, BubbleChartData>('circle');

        if (!this.tooltip) {
            this.tooltip = createTooltip(container);
        }

        registerTooltip(circles as any, this.tooltip, container, (d: BubbleChartData) => {
            return `
        Country: ${ d.country }<br>
        ${ this.yAxisLabel() }: ${ d.yValue }<br>
        ${ this.xAxisLabel() }: ${ d.xValue }<br>
        ${ this.zAxisLabel() }: ${ d.radius }
      `;
        });
    }
}
