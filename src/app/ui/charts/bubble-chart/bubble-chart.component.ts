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

        .bubble-chart-container {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .chart-container {
            width: 100%;
            height: 100%;
            position: relative;
        }
    ` ],
    template: `
        <div class="bubble-chart-container pl-10 pt-10">
            <div #chartContainer class="chart-container"></div>
        </div>
    `,
})
export class BubbleChartComponent extends Chart {
    public data = input.required<BubbleChartData[]>();
    public xAxisLabel = input.required<string>();
    public yAxisLabel = input.required<string>();
    public zAxisLabel = input.required<string>();

    private margin = { top: 10, right: 20, bottom: 30, left: 10 };
    private svg!: Selection<SVGSVGElement, unknown, null, undefined>;

    protected override renderChart(): void {
        const container = this.chartContainer().nativeElement;
        container.innerHTML = '';

        const { width, height } = container.getBoundingClientRect();
        const chartWidth = width - this.margin.left - this.margin.right;
        const chartHeight = height - this.margin.top - this.margin.bottom;

        this.createSvg(container, width, height);
        const { xScale, yScale, zScale } = this.prepareScales(chartWidth, chartHeight);
        this.createAxes(xScale, yScale, chartHeight);
        const bubbles = this.drawBubbles(xScale, yScale, zScale);
        this.addChartTooltip(container, bubbles);
    }

    private createSvg(container: HTMLElement, width: number, height: number): void {
        this.svg = select(container)
            .append('svg')
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

    private createAxes(
        xScale: ScaleLinear<number, number>,
        yScale: ScaleLinear<number, number>,
        chartHeight: number
    ): void {
        this.svg
            .append('g')
            .attr('transform', `translate(0, ${ chartHeight })`)
            .call(axisBottom(xScale));
        this.svg
            .append('g')
            .call(axisLeft(yScale));
    }

    private drawBubbles(
        xScale: ScaleLinear<number, number>,
        yScale: ScaleLinear<number, number>,
        zScale: ScaleLinear<number, number>
    ) {
        return this.svg
            .selectAll('circle')
            .data(this.data())
            .enter()
            .append('circle')
            .attr('cx', d => xScale(d.xValue))
            .attr('cy', d => yScale(d.yValue))
            .attr('r', d => zScale(d.radius))
            .attr('fill', d => d.color as string);
    }

    private addChartTooltip(
        container: HTMLElement,
        circles: Selection<SVGCircleElement, BubbleChartData, SVGGElement, unknown>
    ) {
        const tooltip = createTooltip(container);

        registerTooltip(circles as any, tooltip, container, (d: any) => {
            return `
                Country: ${ d.country }<br>
                ${ this.yAxisLabel() }: ${ d.yValue }<br>
                ${ this.xAxisLabel() }: ${ d.xValue }<br>
                ${ this.zAxisLabel() }: ${ d.radius }
            `;
        });
    }
}
