import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { arc, ScaleBand, scaleBand, scaleLinear, scaleOrdinal, select, Selection, Series, stack } from 'd3';
import { PillLegendComponent } from '../../components/legend/pill-legend.component';
import { Chart } from '../chart.abstract';
import { createTooltip, registerTooltip } from '../tooltip/tooltip';

export interface RadialStackedData {
    groupLabel: string;
    items: {
        [key: string]: number;
    }
}

interface CellData {
    groupLabel: string;
    total: number;
    ranges: {
        label: string;
        start: number;
    }[]
}

@Component({
    selector: 'app-radial-stacked-chart',
    imports: [PillLegendComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    styles: `
        :host {
            display: block;
            position: relative;
            width: 100%;
            height: 100%;

            ::ng-deep {
                svg.radial-bar-chart {
                    overflow: visible;
                }

                .bar-label {
                    font-weight: 600;
                    font-size: 14px;

                    @media (max-width: 768px) {
                        font-size: 12px;
                    }

                    @media (max-width: 640px) {
                        font-size: 10px;
                    }

                    @media (max-width: 480px) {
                        font-size: 9px;
                    }
                }

                text {
                    font-family: sans-serif;
                    font-size: 10px;
                }

                line {
                    stroke: #000;
                }

                circle {
                    fill: none;
                    stroke: #000;
                }

                path {
                    transition: opacity 0.3s;
                }
            }
        }
    `,
    template: `
        <div class="flex flex-col md:flex-row justify-center items-center aspect-square w-full h-full relative">
            <div #chartContainer
                 class="flex-1 w-full md:w-auto md:h-full flex justify-center items-center relative"></div>
            <app-pill-legend [items]="legendItems()"/>
        </div>
    `,
})
export class RadialStackedChartComponent extends Chart<RadialStackedData[]> {
    public data = input.required<RadialStackedData[]>();
    public colors = input.required<string[]>();
    public keys = computed(() => Array.from(new Set(this.data().flatMap(d => Object.keys(d.items)))));
    public legendItems = computed(() => this.keys()
        .filter(key => this.data().some(d => (d.items[key] ?? 0) > 0))
        .map((label, i) => ({
            label,
            color: this.colors()[i % this.colors().length]
        })));
    private z = computed(() => scaleOrdinal<string>().domain(this.keys()).range(this.colors()));
    private yRange = computed<[number, number]>(() => {
        const maxVal = Math.max(...this.data()
            .map(({ items }) => this.keys().reduce((acc, k) => acc + (items[k] ?? 0), 0))
        );
        return [0, maxVal];
    });

    protected override renderChart() {
        console.log(this.data());

        if (!this.data()?.length) return;
        const container = this.chartContainer().nativeElement;
        container.innerHTML = '';
        const { width, height } = container.getBoundingClientRect();
        const size = Math.min(width, height) * 0.8;

        const tooltip = createTooltip(container)
        const { innerRadius, outerRadius, x, y, stackedSeries } = this.createScalesAndData(size);
        const { g } = this.createSVG(container, size);

        this.drawBars(g, stackedSeries as any, x, y, innerRadius, tooltip);
        this.drawLabels(g, x, outerRadius);
        this.drawYAxis(g, y);
    }

    private createScalesAndData(size: number) {
        const innerRadius = size / 5;
        const outerRadius = size / 2;
        const keys = this.keys();
        const x = scaleBand().domain(this.data().map(d => d.groupLabel)).range([0, 2 * Math.PI]).align(0);
        const y = (val: number) => scaleLinear().domain(this.yRange()).range([innerRadius, outerRadius])(val);

        const stackedInput: CellData[] = this.data().map(({ groupLabel, items }) => {
            const ranges: CellData['ranges'] = [];
            let currentTotal = 0;

            for (const [label, value] of Object.entries(items)) {
                const start = currentTotal;
                currentTotal += value;
                ranges.push({ label, start });
            }

            const entries: any = {
                groupLabel,
                total: currentTotal,
                ranges
            };

            this.keys().forEach(key => {
                entries[key] = items[key] ?? 0;
            });

            return entries;
        });

        const stackedSeries = stack().keys(keys)(stackedInput as any);

        return { innerRadius, outerRadius, x, y, stackedSeries };
    }

    private createSVG(container: HTMLElement, size: number) {
        const svg = select(container)
            .append('svg')
            .attr('class', 'radial-bar-chart')
            .attr('width', size)
            .attr('height', size);

        const g = svg.append('g')
            .attr('transform', `translate(${size / 2},${size / 2})`);

        return { svg, g };
    }

    private drawBars(
        g: Selection<SVGGElement, unknown, null, undefined>,
        stackedSeries: Series<any, string>[],
        x: ScaleBand<string>,
        y: (val: number) => number,
        innerRadius: number,
        tooltip: Selection<HTMLDivElement, unknown, null, undefined>,
    ) {
        const arcGen = arc<any>()
            .innerRadius((d: any) => y(d[0]))
            .outerRadius((d: any) => y(d[1]))
            .startAngle((d: any) => x(d.data.groupLabel)!)
            .endAngle((d: any) => x(d.data.groupLabel)! + x.bandwidth()!)
            .padAngle(0.06)
            .padRadius(innerRadius);

        const paths = g.append('g')
            .selectAll('g')
            .data(stackedSeries)
            .enter().append('g')
            .attr('fill', d => this.z()(d.key)!)
            .selectAll('path')
            .data(d => d)
            .enter().append('path')
            .attr('d', d => arcGen(d));

        registerTooltip(paths, tooltip, this.chartContainer().nativeElement, (data) => {
            const [hoveredMin, hoveredMax] = data;
            const { total, ranges, groupLabel } = data.data as CellData;
            const value = hoveredMax - hoveredMin;
            const label = ranges.find(({ start }) => start === hoveredMin)?.label;
            const percentage = (value / total * 100).toFixed(2);
            return `Group: ${groupLabel}<br>Label: ${label}<br>Value: ${value}<br>Percentage: ${percentage}%`;
        });
    }

    private drawLabels(
        g: Selection<SVGGElement, unknown, null, undefined>,
        x: ScaleBand<string>,
        outerRadius: number,
    ) {
        const labelOffset = 30;

        const label = g.append('g')
            .selectAll('g')
            .data(this.data())
            .enter().append('g')
            .attr('text-anchor', 'middle')
            .attr('transform', (d: RadialStackedData) => {
                const angleDeg = (x(d.groupLabel)! + x.bandwidth()! / 2) * 180 / Math.PI - 90;
                return `rotate(${angleDeg})translate(${outerRadius + labelOffset},0)`;
            });

        label.append('text')
            .attr('transform', (d: RadialStackedData) => {
                const midAngle = x(d.groupLabel)! + x.bandwidth()! / 2 + Math.PI / 2;
                return (midAngle % (2 * Math.PI)) < Math.PI
                    ? 'rotate(90)translate(0,16)'
                    : 'rotate(-90)translate(0,-9)';
            })
            .attr('class', 'bar-label')
            .text(d => d.groupLabel);
    }

    private drawYAxis(
        g: Selection<SVGGElement, unknown, null, undefined>,
        y: (val: number) => number,
    ) {
        const yAxis = g.append('g')
            .attr('text-anchor', 'middle');

        const yTicks = [1, 2, 3, 4, 5].map((_, i) => (Math.round(this.yRange()[1] / 5)) * i);
        const yTick = yAxis
            .selectAll('g')
            .data(yTicks)
            .enter().append('g');

        yTick.append('circle')
            .attr('fill', 'none')
            .attr('stroke', '#000')
            .attr('r', d => y(d));

        yTick.append('text')
            .attr('y', d => -y(d))
            .attr('dy', '0.35em')
            .attr('fill', '#fff')
            .attr('stroke', '#fff')
            .attr('stroke-width', 5)
            .text(d => this.format(d));

        yTick.append('text')
            .attr('y', d => -y(d))
            .attr('dy', '0.35em')
            .text(d => this.format(d));

        yAxis.append('text')
            .attr('y', -y(yTicks.pop()!))
            .attr('dy', '-1em')
            .style('font-size', '12px')
            .style('font-weight', 'bold')
            .text('Documents');
    }

    private format(val: number) {
        return val < 1000 ? val.toString() : (val / 1000).toFixed(1) + 'k';
    }
}
