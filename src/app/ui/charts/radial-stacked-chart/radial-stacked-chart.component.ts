import { AfterViewInit, ChangeDetectionStrategy, Component, computed, ElementRef, input, viewChild } from '@angular/core';
import { arc, ScaleBand, scaleBand, scaleLinear, scaleOrdinal, select, Selection, Series, stack } from 'd3';
import { debounceTime, fromEvent, startWith } from 'rxjs';
import { LegendComponent } from '../../legend/legend.component';
import { createTooltip, registerTooltip } from '../tooltip/tooltip';

export interface RadialStackedData {
    groupLabel: string;
    items: {
        [key: string]: number;
    }
}

@Component({
    selector: 'app-radial-stacked-chart',
    imports: [ LegendComponent ],
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
            <app-legend [items]="keys()" [colors]="colors()"/>
        </div>
    `,
})
export class RadialStackedChartComponent implements AfterViewInit {
    private chartContainer = viewChild.required<ElementRef<HTMLElement>>('chartContainer');
    public data = input.required<RadialStackedData[]>();
    public colors = input.required<string[]>();
    public keys = computed<string[]>(() => Array.from(new Set(this.data().flatMap(d => Object.keys(d.items)))));
    private z = computed(() => scaleOrdinal<string>().domain(this.keys()).range(this.colors()));
    private yRange = computed<[number, number]>(() => {
        const maxVal = Math.max(...this.data()
            .map(({ items }) => this.keys().reduce((acc, k) => acc + (items[k] ?? 0), 0))
        );
        return [0, maxVal];
    });

    public ngAfterViewInit() {
        fromEvent(window, 'resize').pipe(
            startWith(null),
            debounceTime(25),
        ).subscribe(() => {
            const { width, height } = this.chartContainer().nativeElement.getBoundingClientRect();
            this.renderChart(Math.min(width, height) * 0.8);
        })
    }

    private renderChart(size: number) {
        if (!this.data()?.length) return;
        const container = this.chartContainer().nativeElement;
        container.innerHTML = '';

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

        const stackedInput = this.data().map(d => {
            const obj: Record<string, number | string> = { groupLabel: d.groupLabel };

            this.keys().forEach(key => {
                obj[key] = d.items[key] ?? 0;
            });

            return obj;
        });

        const stackedSeries = stack().keys(keys)(stackedInput as any);

        return {innerRadius, outerRadius, x, y, stackedSeries};
    }

    private createSVG(container: HTMLElement, size: number) {
        const svg = select(container)
            .append("svg")
            .attr("class", "radial-bar-chart")
            .attr("width", size)
            .attr("height", size);

        const g = svg.append("g")
            .attr("transform", `translate(${size / 2},${size / 2})`);

        return {svg, g};
    }

    private drawBars(
        g: Selection<SVGGElement, unknown, null, undefined>,
        stackedSeries: Series<any, string>[],
        x: ScaleBand<string>,
        y: (val: number) => number,
        innerRadius: number,
        tooltip:Selection<HTMLDivElement, unknown, null, undefined>,
    ) {
        const arcGen = arc<any>()
            .innerRadius((d: any) => y(d[0]))
            .outerRadius((d: any) => y(d[1]))
            .startAngle((d: any) => x(d.data.groupLabel)!)
            .endAngle((d: any) => x(d.data.groupLabel)! + x.bandwidth()!)
            .padAngle(0.01)
            .padRadius(innerRadius);

        const paths = g.append("g")
            .selectAll("g")
            .data(stackedSeries)
            .enter().append("g")
            .attr("fill", d => this.z()(d.key)!)
            .selectAll("path")
            .data(d => d)
            .enter().append("path")
            .attr("d", d => arcGen(d));

        registerTooltip(paths, tooltip, this.chartContainer().nativeElement, (d, event) => {
            const data = event.currentTarget.__data__;
            const [hoveredMin, hoveredMax]= data;
            const range = hoveredMax - hoveredMin;
            const [label, value] = Object.entries(data.data).find(([_, value]) => value === range) ?? [];
            return `Group: ${d.data.groupLabel}<br>Label: ${label}<br>Value: ${value}`;
        });
    }

    private drawLabels(
        g: Selection<SVGGElement, unknown, null, undefined>,
        x: ScaleBand<string>,
        outerRadius: number,
    ) {
        const labelOffset = 30;

        const label = g.append("g")
            .selectAll("g")
            .data(this.data())
            .enter().append("g")
            .attr("text-anchor", "middle")
            .attr('transform', (d: RadialStackedData) => {
                const angleDeg = (x(d.groupLabel)! + x.bandwidth()! / 2) * 180 / Math.PI - 90;
                return `rotate(${ angleDeg })translate(${ outerRadius + labelOffset },0)`;
            });

        label.append("text")
            .attr('transform', (d: RadialStackedData) => {
                const midAngle = x(d.groupLabel)! + x.bandwidth()! / 2 + Math.PI / 2;
                return (midAngle % (2 * Math.PI)) < Math.PI
                    ? "rotate(90)translate(0,16)"
                    : 'rotate(-90)translate(0,-9)';
            })
            .attr('class', 'bar-label')
            .text(d => d.groupLabel);
    }

    private drawYAxis(
        g: Selection<SVGGElement, unknown, null, undefined>,
        y: (val: number) => number,
    ) {
        const yAxis = g.append("g")
            .attr("text-anchor", "middle");

        const yTicks = [1, 2, 3, 4, 5].map((_, i) => (Math.round(this.yRange()[1] / 5)) * i);
        const yTick = yAxis
            .selectAll("g")
            .data(yTicks)
            .enter().append("g");

        yTick.append("circle")
            .attr("fill", "none")
            .attr("stroke", "#000")
            .attr("r", d => y(d));

        yTick.append("text")
            .attr("y", d => -y(d))
            .attr("dy", "0.35em")
            .attr("fill", "#fff")
            .attr("stroke", "#fff")
            .attr("stroke-width", 5)
            .text(d => this.format(d));

        yTick.append("text")
            .attr("y", d => -y(d))
            .attr("dy", "0.35em")
            .text(d => this.format(d));

        yAxis.append("text")
            .attr("y", -y(yTicks.pop()!))
            .attr("dy", "-1em")
            .text("Policies");
    }

    private format(val: number) {
        return val < 1000 ? val.toString() : (val / 1000).toFixed(1) + "k";
    }
}
