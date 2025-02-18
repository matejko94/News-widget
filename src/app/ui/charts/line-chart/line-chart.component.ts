import { Component, computed, effect, input, signal, Signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { axisBottom, axisLeft, line, ScaleLinear, scaleLinear, select, Selection } from 'd3';
import { Checkbox } from 'primeng/checkbox';
import { BoxLegendComponent, LegendItem } from '../../components/legend/box-legend.component';
import { Chart } from '../chart.abstract';
import { createTooltip, registerTooltip } from '../tooltip/tooltip';

export interface LineChartData {
    label: string;
    subLabel: string;
    color: string;
    points: {
        x: number;
        y: number;
    }[];
}

interface GroupLegend {
    label: string;
    hidden: WritableSignal<boolean>;
}

@Component({
    selector: 'app-line-chart',
    imports: [ FormsModule, BoxLegendComponent, Checkbox ],
    styles: `
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
    `,
    template: `
        <div class="flex flex-col md:flex-row justify-center items-center w-full h-full relative pl-2.5">
            <div #chartContainer
                 class="flex-1 w-full h-full flex justify-center items-center relative"></div>
            <div class="flex flex-col-reverse md:flex-col gap-1">
                <div>
                    <div class="font-medium">{{ yAxisLabel() }}</div>
                    <app-box-legend [items]="yLegend()" toggleable class="w-full"/>
                </div>
                <div>
                    <div class="font-medium mt-3">{{ groupLabel() }}</div>
                    @for (item of groupLegend(); track item.label) {
                        <div class="flex items-center cursor-pointer text-xs md:text-sm gap-1">
                            <p-checkbox [(ngModel)]="item.hidden" binary="true" size="small"/>
                            <span class="mt-1">{{ item.label }}</span>
                        </div>
                    }
                </div>
            </div>
        </div>
    `
})
export class LineChartComponent extends Chart {
    public data = input.required<LineChartData[]>();
    private visibleData: Signal<LineChartData[]>;
    public yLegend: Signal<LegendItem[]>;
    public groupLegend: Signal<GroupLegend[]>;
    public xAxisLabel = input.required<string>();
    public yAxisLabel = input.required<string>();
    public groupLabel = input.required<string>();
    private margin = { top: 10, right: 30, bottom: 30, left: 30 };
    private svg!: Selection<SVGSVGElement, unknown, null, undefined>;

    constructor() {
        super();

        this.yLegend = computed(() => this.data().map(series => ({
            id: series.label,
            label: series.label,
            color: series.color,
            hidden: signal(false)
        })));
        this.visibleData = computed(() => {
            const hiddenLabels = new Set(this.yLegend().filter(l => l.hidden()).map(l => l.label));
            const hiddenGroups = new Set(this.groupLegend().filter(l => l.hidden()).map(l => l.label));
            return this.data().filter(({ label, subLabel }) => !hiddenLabels.has(label) && !hiddenGroups.has(subLabel));
        });
        this.groupLegend = computed(() => Array.from(new Set(this.data().flatMap(s => s.subLabel))).map(group => ({
            label: group,
            hidden: signal(false)
        })));
        effect(() => {
            this.visibleData();
            this.groupLabel();
            this.renderChart();
        });
    }

    protected override renderChart(): void {
        const container = this.chartContainer().nativeElement;
        container.innerHTML = '';

        const { width, height } = container.getBoundingClientRect();
        const chartWidth = width - this.margin.left - this.margin.right;
        const chartHeight = height - this.margin.top - this.margin.bottom;

        this.createSvg(container, chartWidth, chartHeight);
        const { xScale, yScale } = this.prepareScales(chartWidth, chartHeight);
        this.createAxes(xScale, yScale, chartHeight);
        this.drawLines(xScale, yScale);
        const points = this.drawPoints(xScale, yScale);
        this.addChartTooltip(container, points);
    }

    private createSvg(container: HTMLElement, width: number, height: number): void {
        this.svg = select(container)
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        this.svg.append('g')
            .attr('transform', `translate(${ this.margin.left }, ${ this.margin.top })`);
    }

    private prepareScales(chartWidth: number, chartHeight: number) {
        const allPoints = this.visibleData().flatMap(series => series.points);
        const xMin = Math.min(...allPoints.map(p => p.x));
        const xMax = Math.max(...allPoints.map(p => p.x));
        const yMin = Math.min(...allPoints.map(p => p.y));
        const yMax = Math.max(...allPoints.map(p => p.y));

        const xScale = scaleLinear()
            .domain([ xMin, xMax ])
            .range([ 0, chartWidth ]);

        const yScale = scaleLinear()
            .domain([ yMin, yMax ])
            .range([ chartHeight, 0 ]);

        return { xScale, yScale };
    }

    private createAxes(xScale: ScaleLinear<number, number>, yScale: ScaleLinear<number, number>, chartHeight: number) {
        this.svg
            .append('g')
            .attr('transform', `translate(0, ${ chartHeight })`)
            .call(axisBottom(xScale).ticks(5));

        this.svg
            .append('g')
            .call(axisLeft(yScale));
    }

    private drawLines(xScale: ScaleLinear<number, number>, yScale: ScaleLinear<number, number>) {
        this.visibleData().forEach(series => {
            this.svg
                .append('path')
                .datum(series.points)
                .attr('fill', 'none')
                .attr('stroke', series.color)
                .attr('stroke-width', 1.5)
                .attr(
                    'd',
                    line<{ x: number; y: number }>()
                        .x(d => xScale(d.x))
                        .y(d => yScale(d.y))
                );
        });
    }

    private drawPoints(xScale: ScaleLinear<number, number>, yScale: ScaleLinear<number, number>) {
        const flattenedData = this.visibleData().flatMap(series =>
            series.points.map(point => ({
                label: series.label,
                subLabel: series.subLabel,
                color: series.color,
                x: point.x,
                y: point.y
            }))
        );

        return this.svg
            .selectAll('circle')
            .data(flattenedData)
            .enter()
            .append('circle')
            .attr('cx', d => xScale(d.x))
            .attr('cy', d => yScale(d.y))
            .attr('r', 3)
            .attr('fill', d => d.color);
    }

    private addChartTooltip(
        container: HTMLElement,
        points: Selection<SVGCircleElement, {
            label: string;
            subLabel: string;
            color: string;
            x: number;
            y: number
        }, SVGGElement, unknown>
    ): void {
        const tooltip = createTooltip(container);

        registerTooltip(points as any, tooltip, container, (d: any) => {
            return `
                <strong>${ d.label }</strong><br>
                ${ this.xAxisLabel() }: ${ d.x }<br>
                ${ this.yAxisLabel() }: ${ d.y }<br>
                ${ this.groupLabel() }: ${ d.subLabel }`;
        });
    }
}
