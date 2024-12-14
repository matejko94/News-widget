import {AfterViewInit, ChangeDetectionStrategy, Component, computed, ElementRef, input, viewChild} from '@angular/core';
import {arc, ScaleBand, scaleBand, scaleLinear, scaleOrdinal, select, Selection, Series, stack} from "d3";
import {debounceTime, fromEvent, startWith} from "rxjs";
import {createTooltip, registerTooltip} from "../tooltip/tooltip";

export interface RadialStackedData {
    groupLabel: string;
    items: {
        [key: string]: number;
    }
}

@Component({
    selector: 'app-radial-stacked-chart',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: `
      :host {
        display: block;
        position: relative;
        width: 100%;
        height: 100%;
      }

      ::ng-deep svg.radial-bar-chart {
        overflow: visible;
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

      .tooltip {
        position: absolute;
        pointer-events: none;
        background: #fff;
        border: 1px solid #ccc;
        padding: 4px 8px;
        font-size: 10px;
        border-radius: 3px;
        box-shadow: 0 0 4px rgba(0,0,0,0.3);
      }
    `,
    template: `
        <div class="flex justify-center items-center aspect-square w-full relative">
            <div #chartContainer class="flex-1 w-full aspect-square flex justify-center items-center max-md:mt-8"></div>
            <ul class="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col p-2">
                @for (entry of legendEntries(); track entry.key) {
                    <li class="flex gap-0.5 sm:gap-2 items-center text-[0.5rem] sm:text-xs md:text-sm text-gray-600">
                        <div class="size-2 sm:size-3 md:size-4 rounded-sm sm:rounded"
                             [style.background-color]="entry.color"></div>
                        {{ entry.key }}
                    </li>
                }
            </ul>
        </div>
    `,
})
export class RadialStackedChartComponent implements AfterViewInit {
    private colors = ["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"];
    private chartContainer = viewChild.required<ElementRef<HTMLElement>>('chartContainer');
    public data = input.required<RadialStackedData[]>();

    private keys = computed<string[]>(() => Array.from(new Set(this.data().flatMap(d => Object.keys(d.items)))));
    private z = computed(() => scaleOrdinal<string>().domain(this.keys()).range(this.colors));
    private yRange = computed<[number, number]>(() => {
        const maxVal = Math.max(...this.data().map(({items}) => this.keys().reduce((acc, k) => acc + items[k], 0)));
        return [0, maxVal];
    });
    public legendEntries = computed(() => this.keys().map(key => ({key, color: this.z()(key) as string})));

    public ngAfterViewInit() {
        fromEvent(window, 'resize').pipe(
            startWith(null),
            debounceTime(25),
        ).subscribe(() => {
            const {width} = this.chartContainer().nativeElement.getBoundingClientRect();
            this.renderChart(width * 0.9);
        })
    }

    private renderChart(size: number) {
        if (!this.data()?.length) return;
        const container = this.chartContainer().nativeElement;
        container.innerHTML = '';

        const tooltip = createTooltip(container)
        const {innerRadius, x, y, stackedSeries} = this.createScalesAndData(size);
        const {g } = this.createSVG(container, size);

        this.drawBars(g, stackedSeries as any, x, y, innerRadius, tooltip);
        this.drawLabels(g, x, innerRadius);
        this.drawYAxis(g, y);
    }

    private createScalesAndData(size: number) {
        const innerRadius = size / 5;
        const outerRadius = size / 2;
        const keys = this.keys();
        const x = scaleBand().domain(this.data().map(d => d.groupLabel)).range([0, 2 * Math.PI]).align(0);
        const y = (val: number) => scaleLinear().domain(this.yRange()).range([innerRadius, outerRadius])(val);

        const stackedInput = this.data().map(d => {
            const obj: Record<string, number> = {groupLabel: 0 as unknown as number};
            (obj as any).groupLabel = d.groupLabel;
            keys.forEach(key => {
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

        registerTooltip(paths, tooltip, (d, event) => {
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
        innerRadius: number
    ) {
        const label = g.append("g")
            .selectAll("g")
            .data(this.data)
            .enter().append("g")
            .attr("text-anchor", "middle")
            .attr("transform", (d: RadialStackedData) =>
                `rotate(${(x(d.groupLabel)! + x.bandwidth()! / 2) * 180 / Math.PI - 90})translate(${innerRadius},0)`);

        label.append("line")
            .attr("x2", -5)
            .attr("stroke", "#000");

        label.append("text")
            .attr("transform", (d: RadialStackedData) =>
                ((x(d.groupLabel)! + x.bandwidth()! / 2 + Math.PI / 2) % (2 * Math.PI)) < Math.PI
                    ? "rotate(90)translate(0,16)"
                    : "rotate(-90)translate(0,-9)")
            .text(d => d.groupLabel);
    }

    private drawYAxis(
        g: Selection<SVGGElement, unknown, null, undefined>,
        y: (val: number) => number,
    ) {
        const yAxis = g.append("g")
            .attr("text-anchor", "middle");

        const yTicks = [1, 2, 3, 4, 5].map((_, i) => (this.yRange()[1] / 5) * i);
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
            .text("Population");
    }

    private format(val: number) {
        return val < 1000 ? val.toString() : (val / 1000).toFixed(1) + "k";
    }
}
