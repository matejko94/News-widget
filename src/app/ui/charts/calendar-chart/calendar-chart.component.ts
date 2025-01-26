import { Component, effect, input } from '@angular/core';
import { groups, interpolatePiYG, quantile, ScaleSequential, scaleSequential, select, Selection, utcFormat, utcMonday, utcMonth, utcMonths, utcYear } from 'd3';
import { Chart } from '../chart.abstract';
import { createTooltip, registerTooltip } from '../tooltip/tooltip';

export interface CalendarData {
    date: Date;
    count: number;
}

@Component({
    selector: 'app-calendar-chart',
    styles: [ `
        :host {
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;
        }

        .calendar-chart-container {
            width: 100%;
            height: 100%;
            position: relative;
        }

        svg {
            overflow: visible;
        }
    ` ],
    template: `
        <div class="calendar-chart-container" #chartContainer></div>
    `
})
export class CalendarChartComponent extends Chart {
    public data = input.required<CalendarData[]>();

    private margin = { top: 0, right: 0, bottom: 0, left: 40 };
    private cellSize = 16;
    private widthMultiplier = 53;
    private heightMultiplier = 7;
    private svg!: Selection<SVGSVGElement, unknown, null, unknown>;
    private colorScale!: ScaleSequential<string>;
    private years: [ number, CalendarData[] ][] = [];

    constructor() {
        super();

        effect(() => {
            this.data();
            this.renderChart();
        });
    }

    protected override renderChart(): void {
        const container = this.chartContainer().nativeElement;
        container.innerHTML = '';

        const totalHeight = this.cellSize * this.heightMultiplier * this.groupByYears().length;
        this.createSvg(container, totalHeight);
        this.computeColorScale();
        this.drawYears();
        this.drawDayLabels();
        const rects = this.drawCells();
        this.addChartTooltip(container, rects);
        this.drawMonthSeparators();
    }

    private createSvg(container: HTMLElement, totalHeight: number): void {
        this.svg = select(container)
            .append('svg')
            .attr('width', (this.cellSize + 1.5) * this.widthMultiplier + this.margin.left)
            .attr('height', totalHeight)
            .attr('viewBox', [ 0, 0, (this.cellSize + 1.5) * this.widthMultiplier, totalHeight ])
            .style('max-width', '100%')
            .style('height', 'auto')
            .style('font', '10px sans-serif');
    }

    private groupByYears(): [ number, CalendarData[] ][] {
        const sorted = this.data().slice().sort((a, b) => a.date.getTime() - b.date.getTime());
        this.years = groups(sorted, d => d.date.getUTCFullYear()).reverse() as [ number, CalendarData[] ][];
        return this.years;
    }

    private computeColorScale(): void {
        const maxVal = quantile(this.data(), 0.9975, d => Math.abs(d.count)) || 0;
        this.colorScale = scaleSequential(interpolatePiYG).domain([ -maxVal, maxVal ]);
    }

    private drawYears(): void {
        this.svg
            .selectAll<SVGGElement, [ number, CalendarData[] ]>('g.year')
            .data(this.years)
            .join('g')
            .attr('class', 'year')
            .attr(
                'transform',
                (_, i) => `translate(${ this.margin.left + 0.5 }, ${ this.cellSize * 1.5 + this.cellSize * this.heightMultiplier * i })`
            )
            .append('text')
            .attr('x', -5)
            .attr('y', -5)
            .attr('font-weight', 'bold')
            .attr('text-anchor', 'end')
            .text(([ year ]) => year);
    }

    private drawDayLabels(): void {
        this.svg
            .selectAll<SVGGElement, [ number, CalendarData[] ]>('g.year')
            .append('g')
            .attr('text-anchor', 'end')
            .selectAll('text')
            .data([ 1, 2, 3, 4, 5 ])
            .join('text')
            .attr('x', -5)
            .attr('y', d => ((d + 6) % 7 + 0.5) * this.cellSize)
            .attr('dy', '0.31em')
            .text(d => 'SMTWTFS'[d]);
    }

    private drawCells(): Selection<SVGRectElement, CalendarData, SVGGElement, [ number, CalendarData[] ]> {
        return this.svg
            .selectAll<SVGGElement, [ number, CalendarData[] ]>('g.year')
            .append('g')
            .selectAll<SVGRectElement, CalendarData>('rect')
            .data(([ , values ]) => values.filter(d => ![ 0, 6 ].includes(d.date.getUTCDay())))
            .join('rect')
            .attr('width', this.cellSize - 1)
            .attr('height', this.cellSize - 1)
            .attr('x', d => utcMonday.count(utcYear(d.date), d.date) * this.cellSize + 0.5)
            .attr('y', d => ((d.date.getUTCDay() + 6) % 7) * this.cellSize + 0.5)
            .attr('fill', d => this.colorScale(d.count));
    }

    private addChartTooltip(
        container: HTMLElement,
        rects: Selection<SVGRectElement, CalendarData, SVGGElement, [ number, CalendarData[] ]>
    ): void {
        const tooltip = createTooltip(container);
        registerTooltip(rects, tooltip, container, (d: CalendarData) => {
            const fd = utcFormat('%x');
            return `
                Date: ${ fd(d.date) }<br />
                News: ${ d.count }
            `;
        });
    }

    private drawMonthSeparators(): void {
        this.svg
            .selectAll<SVGGElement, [ number, CalendarData[] ]>('g.year')
            .append('g')
            .selectAll<SVGGElement, Date>('g.month')
            .data(([ , values ]) => {
                const start = utcMonth(values[0].date);
                const end = values.at(-1)?.date || values[0].date;
                return utcMonths(start, end);
            })
            .join('g')
            .call(g => g
                .filter((_, i) => !!i)
                .append('path')
                .attr('fill', 'none')
                .attr('stroke', '#fff')
                .attr('stroke-width', 3)
                .attr('d', d => {
                    const w = utcMonday.count(utcYear(d), d);
                    const day = (d.getUTCDay() + 6) % 7;
                    if (day === 0) return `M${ w * this.cellSize },0V${ 5 * this.cellSize }`;
                    if (day === 5) return `M${ (w + 1) * this.cellSize },0V${ 5 * this.cellSize }`;
                    return `M${ (w + 1) * this.cellSize },0V${ day * this.cellSize }H${ w * this.cellSize }V${ 5 * this.cellSize }`;
                })
            )
            .call(g => g
                .append('text')
                .attr('x', d => utcMonday.count(utcYear(d), utcMonday.ceil(d)) * this.cellSize + 2)
                .attr('y', -5)
                .text(utcFormat('%b'))
            );
    }
}
