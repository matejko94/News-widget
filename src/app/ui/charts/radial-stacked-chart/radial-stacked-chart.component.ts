import { ChangeDetectionStrategy, Component, computed, effect, input, output } from '@angular/core';
import { arc, ScaleBand, scaleBand, scaleLinear, scaleOrdinal, select, Selection, Series, SeriesPoint, stack } from 'd3';
import { PillLegendComponent } from '../../components/legend/pill-legend.component';
import { Chart } from '../chart.abstract';
import { createTooltip, registerTooltip } from '../tooltip/tooltip';

export interface RadialStackedData {
    groupLabel: string;
    items: {
        [key: string]: number;
    }
}

/** One clicked stack segment: the topic (bar) and the SDG / OER key within it. */
export interface RadialSegmentSelection {
    groupLabel: string;
    label: string;
    value: number;
    groupTotal: number;
}

interface CellData {
    groupLabel: string;
    total: number;
}

/** A stacked arc's datum: d3's [start, end] pair, plus the stack key it was drawn for. */
type StackedPoint = SeriesPoint<CellData> & { key: string };

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

                path.bar-segment {
                    cursor: pointer;
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
    // Optional explicit color per stack key (e.g. official SDG colors). When a
    // key is absent from the map it falls back to the index-based palette.
    public colorMap = input<Record<string, string> | null>(null);
    // Currently highlighted segment. Owned by the page so it survives re-renders; the chart
    // only dims everything else.
    public selected = input<RadialSegmentSelection | null>(null);
    // Emits the clicked segment, or null when the same segment is clicked again (toggle off).
    public segmentSelect = output<RadialSegmentSelection | null>();
    public keys = computed(() => Array.from(new Set(this.data().flatMap(d => Object.keys(d.items)))));
    public legendItems = computed(() => this.keys()
        .filter(key => this.data().some(d => (d.items[key] ?? 0) > 0))
        .map((label, i) => ({
            label,
            color: this.colorMap()?.[label] ?? this.colors()[i % this.colors().length]
        })));
    private barPaths: Selection<SVGPathElement, any, any, any> | null = null;
    private z = computed(() => scaleOrdinal<string>().domain(this.keys()).range(this.colors()));
    private yRange = computed<[number, number]>(() => {
        const maxVal = Math.max(...this.data()
            .map(({ items }) => this.keys().reduce((acc, k) => acc + (items[k] ?? 0), 0))
        );
        return [0, maxVal];
    });

    constructor() {
        super();
        // Re-apply the highlight whenever the selection changes. Separate from renderChart so
        // clicking a segment doesn't rebuild the whole chart.
        effect(() => {
            this.selected();
            this.applyHighlight();
        });
    }

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
            const entries: any = {
                groupLabel,
                total: keys.reduce((sum, key) => sum + (items[key] ?? 0), 0)
            };

            keys.forEach(key => {
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
            .attr('fill', d => this.colorFor(d.key))
            .selectAll('path')
            // Stamp the series key onto every point. Matching a point back to its key by its
            // start offset is not safe: bars list their SDGs in their own order and zero-valued
            // keys share a start, so the lookup could land on the wrong key or on none.
            .data(series => series.map(point => Object.assign(point, { key: series.key })))
            .enter().append('path')
            .attr('class', 'bar-segment')
            .attr('d', d => arcGen(d))
            .on('click', (_event, d) => this.onSegmentClick(d));

        this.barPaths = paths as any;
        this.applyHighlight();

        registerTooltip(paths, tooltip, this.chartContainer().nativeElement, (data) => {
            const { groupLabel, label, value, groupTotal } = this.segmentOf(data);
            const percentage = (value / groupTotal * 100).toFixed(2);
            return `Group: ${groupLabel}<br>Label: ${label}<br>Value: ${value}<br>`
                + `Percentage: ${percentage}%<br><i>Click to see what is counted</i>`;
        });
    }

    /** The topic / key pair a stacked arc stands for. */
    private segmentOf(data: StackedPoint): RadialSegmentSelection {
        return {
            groupLabel: data.data.groupLabel,
            label: data.key,
            value: data[1] - data[0],
            groupTotal: data.data.total
        };
    }

    private onSegmentClick(data: StackedPoint) {
        const segment = this.segmentOf(data);
        // Clicking the open segment again closes it.
        this.segmentSelect.emit(this.isSelected(segment) ? null : segment);
    }

    private isSelected(segment: RadialSegmentSelection): boolean {
        const selected = this.selected();
        return !!selected
            && selected.groupLabel === segment.groupLabel
            && selected.label === segment.label;
    }

    /** Dim every arc except the selected one. No-op until the arcs have been drawn. */
    private applyHighlight() {
        if (!this.barPaths) return;

        const hasSelection = !!this.selected();
        this.barPaths.attr('opacity', (d: any) =>
            !hasSelection || this.isSelected(this.segmentOf(d)) ? 1 : 0.2
        );
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

    private colorFor(key: string): string {
        return this.colorMap()?.[key] ?? this.z()(key)!;
    }

    private format(val: number) {
        return val < 1000 ? val.toString() : (val / 1000).toFixed(1) + 'k';
    }
}
