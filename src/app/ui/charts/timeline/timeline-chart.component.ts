import { Component, input } from '@angular/core';
import { axisBottom, axisTop, max, min, pointer, scaleBand, ScaleBand, scaleLinear, ScaleLinear, select, Selection } from 'd3';
import { PillLegendComponent } from '../../legend/pill-legend.component';
import { Chart } from '../chart.abstract';
import { createTooltip, registerTooltip } from '../tooltip/tooltip';

export interface TimelineRow {
    name: string;
    sdg: number;
    years: number[];
    color: string;
}

@Component({
    selector: 'app-timeline-chart',
    imports: [
        PillLegendComponent
    ],
    styles: [ `
        :host {
            display: block;
            position: relative;
            width: 100%;
            height: 100%;

            ::ng-deep {
                .row-label {
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

                svg.timeline-chart {
                    overflow: visible;
                }
            }
        }
    ` ],
    template: `
        <div class="flex flex-col md:flex-row justify-center items-center aspect-square w-full h-full relative">
            <app-pill-legend [items]="legend()"/>
            <div class="pl-28 xs:pl-32 sm:pl-36 flex-1 flex justify-center items-center w-full md:w-auto md:h-full">
                <div #chartContainer class="w-full h-full relative"></div>
            </div>
        </div>
    `
})
export class TimelineChartComponent extends Chart {
    public data = input.required<TimelineRow[]>();
    public legend = input.required<{ label: string, color: string }[]>();
    private margin = { top: 70, right: 20, bottom: 40, left: 40 };
    private svg?: Selection<SVGSVGElement, unknown, null, undefined>;
    private line?: Selection<SVGLineElement, unknown, null, undefined>;
    private tooltip?: Selection<HTMLDivElement, unknown, null, undefined>;
    private g?: Selection<SVGGElement, unknown, null, undefined>;
    private xScale!: ScaleLinear<number, number>;
    private yScale!: ScaleBand<string>;

    protected override renderChart(): void {
        if (!this.data() || !this.data().length) {
            return;
        }

        const container = this.chartContainer().nativeElement;
        container.innerHTML = '';
        const { width, height } = container.getBoundingClientRect();

        this.svg = select(container)
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .attr('class', 'timeline-chart');
        this.g = this.svg
            .append('g')
            .attr('transform', `translate(${ this.margin.left }, ${ this.margin.top })`);
        this.tooltip = createTooltip(container);

        this.drawScales(width, height);
        this.drawRows();
        this.drawRowLabels();
        this.drawAxes(height);
        this.drawVerticalLine(height, width);
    }

    private drawScales(width: number, height: number): void {
        const allYears = this.data().flatMap((d) => d.years);
        const xMin = min(allYears)!;
        const xMax = max(allYears)! + 1;

        this.xScale = scaleLinear()
            .domain([ xMin, xMax ])
            .range([ 0, width - this.margin.left - this.margin.right ]);

        this.yScale = scaleBand()
            .domain(Array.from(new Set(this.data().map((d) => d.name))))
            .range([ 0, height - this.margin.top - this.margin.bottom ])
            .paddingInner(0.2);
    }

    private drawRows(): void {
        const groups = this.g!
            .selectAll('g.civ')
            .data(this.data())
            .enter()
            .append('g')
            .attr('class', 'civ')
            .attr('transform', (d) => `translate(0, ${ this.yScale(d.name) || 0 })`);

        const rects = groups
            .selectAll('rect')
            .data((d) => d.years.map((year) => ({ year, color: d.color, name: d.name, sdg: d.sdg })))
            .enter()
            .append('rect')
            .attr('x', (d) => this.xScale(d.year))
            .attr('y', 0)
            .attr('width', this.xScale(1) - this.xScale(0)) // Adjust for year granularity
            .attr('height', this.yScale.bandwidth())
            .attr('fill', (d) => d.color);

        registerTooltip(
            rects as any,
            this.tooltip!,
            this.chartContainer().nativeElement,
            (d) => {
                // @ts-ignore
                return `<strong>${ d.name }</strong><br>Years: ${ d.year }<br>SDG: ${ d.sdg }`
            }
        );
    }

    private drawAxes(height: number): void {
        this.svg
            ?.append('g')
            .attr('transform', `translate(${ this.margin.left }, ${ this.margin.top - 10 })`)
            .call(axisTop(this.xScale).ticks(5));

        this.svg
            ?.append('g')
            .attr('transform', `translate(${ this.margin.left }, ${ height - this.margin.bottom })`)
            .call(axisBottom(this.xScale).ticks(5));
    }

    private drawRowLabels(): void {
        this.g!
            .selectAll('text.row-label')
            .data(this.data())
            .enter()
            .append('text')
            .attr('class', 'row-label')
            .attr('x', -10)
            .attr('y', (d) => (this.yScale(d.name) || 0) + this.yScale.bandwidth() / 2)
            .attr('text-anchor', 'end')
            .attr('dominant-baseline', 'middle')
            .style('fill', '#333')
            .text(d => d.name);
    }

    private drawVerticalLine(height: number, width: number): void {
        this.line = this.svg
            ?.append('line')
            .attr('y1', this.margin.top - 10)
            .attr('y2', height - this.margin.bottom)
            .attr('stroke', 'rgba(0,0,0,0.2)')
            .style('pointer-events', 'none')
            .style('opacity', 0);

        this.svg!.on('mousemove', (event) => {
            const [ mx, my ] = pointer(event);

            // Only show the line if within the chart area
            if (
                mx > this.margin.left &&
                mx < width - this.margin.right &&
                my > this.margin.top - 10 &&
                my < height - this.margin.bottom
            ) {
                this.line?.style('opacity', 1).attr('transform', `translate(${ mx }, 0)`);
            } else {
                this.line?.style('opacity', 0);
            }
        });
    }
}
