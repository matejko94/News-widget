import { AfterViewInit, Component, DestroyRef, effect, ElementRef, inject, input, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { axisBottom, scaleBand, ScaleBand, scaleLinear, ScaleLinear, select, Selection, Series, stack, stackOffsetExpand } from 'd3';
import { debounceTime, fromEvent, startWith } from 'rxjs';
import { SDG_COLOR_SHADES } from '../../../../../configuration/colors/policy/sdg.colors';
import { createTooltip, registerTooltip } from '../tooltip/tooltip';

interface Data {
    sdg: string;
    policy: string;
    count: number;
}

@Component({
    selector: 'app-barcode-chart',
    styles: `
        :host {
            display: flex;
            justify-items: center;
            align-items: center;
            width: 100%;
            height: 100%;
        }
    `,
    template: `
        <div #chartContainer></div>
    `,
})
export class BarcodeChartComponent implements AfterViewInit {
    private destroyRef = inject(DestroyRef);

    public chartContainer = viewChild.required<ElementRef>('chartContainer');
    public data = input.required<Data[]>();

    private width = 928;
    private height = 500;
    private marginTop = 70;
    private marginRight = 20;
    private marginBottom = 40;
    private marginLeft = 40;

    private svg!: Selection<SVGSVGElement, unknown, null, undefined>;
    private series!: Series<Data[][], string>[];
    private tooltip!: Selection<HTMLDivElement, unknown, null, undefined>;
    private xScale!: ScaleBand<string>;
    private yScale!: ScaleLinear<number, number>;
    private colors = SDG_COLOR_SHADES.colors;

    constructor() {
        effect(() => {
            if (this.data()) {
                this.renderChart(this.data());
            }
        });
    }

    public ngAfterViewInit(): void {
        fromEvent(window, 'resize').pipe(
            debounceTime(25),
            startWith(null),
            takeUntilDestroyed(this.destroyRef),
        ).subscribe(() => this.renderChart(this.data()));
    }

    private renderChart(data: Data[]): void {
        const container = this.chartContainer().nativeElement;
        container.innerHTML = '';

        this.buildStackedSeries(data);
        this.defineScales(data);
        this.createSvg();

        this.tooltip = createTooltip(this.chartContainer().nativeElement);

        this.drawStackedBars();
        this.drawAxes();
    }

    private buildStackedSeries(data: Data[]): void {
        const groupedData = data.reduce((acc, d) => {
            if (!acc[d.sdg]) {
                acc[d.sdg] = new Map();
            }
            acc[d.sdg].set(d.policy, d.count);
            return acc;
        }, {} as Record<string, Map<string, number>>);

        // @ts-ignore
        this.series = stack()
            .keys(Array.from(new Set(data.map(d => d.policy))))
            // @ts-ignore
            .value(([ , map ], key) => map.get(key) ?? 0)
            .offset(stackOffsetExpand)
            // @ts-ignore
            (Object.entries(groupedData));
    }

    private defineScales(data: Data[]): void {
        const sdgs = Array.from(new Set(data.map(d => d.sdg)));
        const yDomain: [ number, number ] = [ 0, 1 ];

        this.xScale = scaleBand()
            .domain(sdgs)
            .range([ this.marginLeft, this.width - this.marginRight ])
            .padding(0.05);

        this.yScale = scaleLinear()
            .domain(yDomain)
            .range([ this.height - this.marginBottom, this.marginTop ]);
    }

    private createSvg(): void {
        this.svg = select(this.chartContainer().nativeElement)
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('viewBox', [ 0, 0, this.width, this.height ].join(' '))
            .style('max-width', '100%');
    }

    private drawStackedBars(): void {
        const g = this.svg.append('g')
            .selectAll('g')
            .data(this.series)
            .join('g');

        let total = 0;
        const totalGroups = 17;
        const rects = g
            .selectAll('rect')
            .data(D => D.map(d => {
                (d as any).key = (D as any).key;
                return d;
            }))
            .join('rect')
            .attr('x', d => this.xScale(d.data[0] as any)!)
            .attr('y', d => this.yScale(d[1]))
            .attr('width', this.xScale.bandwidth())
            .attr('height', d => this.yScale(d[0]) - this.yScale(d[1]))
            .attr('fill', () => {
                const schemeIndex = total % totalGroups;
                const colorIndex = Math.floor(total / 55);
                console.log({
                    colorIndex,
                    color: this.colors[schemeIndex][colorIndex]
                });
                const color = this.colors[schemeIndex][colorIndex];
                total++;
                return color;
            });

        registerTooltip(rects as any, this.tooltip, (d) => {
            const [ sdg, map ] = d.data;
            const key = (d as any).key;
            return `SDG: ${ sdg }<br>Policy: ${ key }<br>Count: ${ map?.get(key) ?? 0 }`;
        });
    }

    private drawAxes(): void {
        this.svg.append('g')
            .attr('transform', `translate(0, ${ this.height - this.marginBottom })`)
            .call(axisBottom(this.xScale))
            .selectAll('text')
            .attr('transform', 'rotate(-45)')
            .style('text-anchor', 'end');
    }
}
