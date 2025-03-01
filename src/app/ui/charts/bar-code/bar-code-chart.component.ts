import { Component, effect, input } from '@angular/core';
import { axisBottom, scaleBand, ScaleBand, scaleLinear, ScaleLinear, select, Selection, Series, SeriesPoint, stack, stackOffsetExpand } from 'd3';
import { SDG_COLOR_SHADES } from '../../../../../configuration/colors/policy/sdg.colors';
import { Chart } from '../chart.abstract';
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

            ::ng-deep {
                svg {
                    overflow: hidden
                }

                .axis-label {
                    font-weight: 600;
                    font-size: 14px;

                    @media (max-width: 480px) {
                        font-size: 11px;
                    }
                }
            }
        }
    `,
    template: `
        <div #chartContainer class="h-full w-full overflow-hidden flex justify-center items-center"></div>
    `,
})
export class BarcodeChartComponent extends Chart {
    public data = input.required<Data[]>();
    private width = 928;
    private height = 500;
    private marginTop = 70;
    private marginRight = 10;
    private marginBottom = 100;
    private marginLeft = 10;

    private svg!: Selection<SVGSVGElement, unknown, null, undefined>;
    private series!: Series<Map<string, number>[], string>[];
    private tooltip!: Selection<HTMLDivElement, unknown, null, undefined>;
    private xScale!: ScaleBand<string>;
    private yScale!: ScaleLinear<number, number>;
    private colors = SDG_COLOR_SHADES.colors;
    private groupedData: Record<string, Map<string, number>> = {};

    constructor() {
        super();

        effect(() => {
            if (this.data()) {
                this.renderChart();
            }
        });
    }

    protected override renderChart(): void {
        const data = this.data();

        if (!data) {
            return;
        }

        const container = this.chartContainer().nativeElement;
        container.innerHTML = '';
        const { width, height } = container.getBoundingClientRect();

        if (height < width * 0.55) {
            this.height = height;
            this.width = height / 0.55;
        } else {
            this.width = width;
            this.height = width * 0.55;
        }

        this.buildStackedSeries(data);
        this.defineScales(data);
        this.createSvg();

        this.tooltip = createTooltip(this.chartContainer().nativeElement);

        this.drawStackedBars();
        this.drawAxes();
    }

    private buildStackedSeries(data: Data[]): void {
        this.groupedData = data.reduce((acc, d) => {
            if (!acc[d.sdg]) {
                acc[d.sdg] = new Map();
            }
            acc[d.sdg].set(d.policy, d.count);
            return acc;
        }, {} as Record<string, Map<string, number>>);

        this.series = stack<Map<string, number>[]>()
            .keys(Array.from(new Set(data.map(d => d.policy))))
            .value(([ _, map ], key) => map.get(key) ?? 0)
            // @ts-ignore
            .offset(stackOffsetExpand)(Object.entries(this.groupedData));
    }

    private defineScales(data: Data[]): void {
        const sdgs = Array.from(new Set(data.map(d => d.sdg)));
        const yDomain: [ number, number ] = [ 0, 1 ];

        this.xScale = scaleBand()
            .domain(sdgs)
            .range([ this.marginLeft, this.width - this.marginRight ])
            .padding(0.1);

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

        const barGap = 4;
        const totalSdgs = 17;
        const sdgPolicyCount = new Map<string, number>();
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
            .attr('height', d => {
                const barHeight = Math.max(0, this.yScale(d[0]) - this.yScale(d[1]));
                return Math.max(0, barHeight - barGap);
            })
            .attr('fill', (d) => {
                const key: string = (d as any).key;
                const sdg = d.data[0] as unknown as string;

                if (!sdgPolicyCount.has(sdg)) {
                    sdgPolicyCount.set(sdg, 0);
                }

                const policyCount = sdgPolicyCount.get(sdg)! ?? 0;
                const schemeIndex = [ ...sdgPolicyCount.keys() ].indexOf(sdg);
                const colorIndex = policyCount % totalSdgs;

                if (!this.groupedData[sdg].has(key)) {
                    return 'white';
                }

                sdgPolicyCount.set(sdg, policyCount + 1);

                return this.colors[schemeIndex][colorIndex];
            }) as Selection<SVGRectElement, SeriesPoint<Map<string, number>[]>, SVGGElement, Series<Map<string, number>[], string>>;

        registerTooltip(rects, this.tooltip, this.chartContainer().nativeElement, (d) => {
            const [ sdg, map ] = d.data;
            const key = (d as any).key;
            const value = map.get(key) ?? 0;
            const total = Array.from(map.values()).reduce((acc, val) => acc + val, 0);
            const percentage = value / total * 100;
            return `${ sdg }<br>Policy: ${ key }<br>Count: ${ value }<br>Percentage: ${ percentage.toFixed(2) }%`;
        });
    }

    private drawAxes(): void {
        this.svg.append('g')
            .attr('transform', `translate(0, ${ this.height - this.marginBottom })`)
            .call(axisBottom(this.xScale).tickPadding(10))
            .selectAll('text')
            .attr('class', 'axis-label')
            .style('text-anchor', 'middle')
            .attr('dy', '1.5em')
            .attr('transform', 'rotate(90) translate(40, -30)');
    }
}
