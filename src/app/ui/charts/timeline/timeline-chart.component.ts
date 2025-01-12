import { AfterViewInit, Component, ElementRef, input, viewChild } from '@angular/core';
import { axisBottom, axisTop, max, min, pointer, scaleBand, ScaleBand, scaleLinear, ScaleLinear, select, Selection } from 'd3';
import { debounceTime, fromEvent, startWith } from 'rxjs';

export interface TimelineRow {
    name: string;
    years: number[];
    color: string;
}

@Component({
    selector: 'app-timeline-chart',
    template: `
        <div #chartContainer class="w-full h-full"></div>
    `,
    styles: [ `
        :host {
            display: block;
            position: relative;
            width: 100%;
            height: 100%;
        }
    ` ]
})
export class TimelineChartComponent implements AfterViewInit {
    public chartContainer = viewChild.required<ElementRef<HTMLDivElement>>('chartContainer');
    public data = input.required<TimelineRow[]>();
    private width = 800;
    private height = 500;
    private margin = { top: 70, right: 20, bottom: 40, left: 40 };
    private svg?: Selection<SVGSVGElement, unknown, null, undefined>;
    private line?: Selection<SVGLineElement, unknown, null, undefined>;
    private g?: Selection<SVGGElement, unknown, null, undefined>;
    private xScale!: ScaleLinear<number, number>;
    private yScale!: ScaleBand<string>;

    public ngAfterViewInit(): void {
        fromEvent(window, 'resize').pipe(
            startWith(null),
            debounceTime(25),
        ).subscribe(() => this.renderChart())
    }

    private renderChart(): void {
        if (!this.data() || !this.data().length) {
            return;
        }

        console.log('Rendering chart with data:', this.data());

        const container = this.chartContainer().nativeElement;
        container.innerHTML = '';
        const containerRect = container.getBoundingClientRect();
        const width = containerRect.width || this.width;
        const height = containerRect.height || this.height;

        // 3) Create the SVG
        this.svg = select(container)
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        // 4) Main group offset by margins
        this.g = this.svg
            .append('g')
            .attr('transform', `translate(${ this.margin.left }, ${ this.margin.top })`);

        // 5) Prepare the domain for xScale and yScale
        //    - xScale domain: min/max of all years
        const allYears = this.data().flatMap((d) => d.years);
        const xMin = min(allYears) ?? 0;
        const xMax = max(allYears) ?? 100;

        this.xScale = scaleLinear()
            .domain([ xMin, xMax ])
            .range([ 0, width - this.margin.left - this.margin.right ]);

        //    - yScale domain: unique names
        const names = Array.from(new Set(this.data().map((d) => d.name)));
        this.yScale = scaleBand()
            .domain(names)
            .range([ 0, height - this.margin.top - this.margin.bottom ])
            .paddingInner(0.2);

        // 6) Bind data to 'g' elements for each row (civilization)
        const groups = this.g
            .selectAll('g.civ')
            .data(this.data)
            .enter()
            .append('g')
            .attr('class', 'civ')
            .attr('transform', (d) => {
                return `translate(0, ${ this.yScale(d.name) || 0 })`;
            });

        // 7) Draw rectangles (or your shape) for each row
        //    Here we assume row.years = [start, end]
        groups
            .append('rect')
            .attr('x', (d) => this.xScale(d.years[0]))
            .attr('y', 0)
            .attr('width', (d) => {
                // For safety, handle multiple array lengths, but assume [start, end]
                if (d.years.length < 2) return 0;
                const [ start, end ] = d.years;
                return this.xScale(Math.max(start, end)) - this.xScale(Math.min(start, end));
            })
            .attr('height', this.yScale.bandwidth())
            .attr('fill', (d) => d.color);

        // 8) Draw axes on top and bottom
        //    - Top axis
        this.svg
            .append('g')
            .attr('transform', `translate(${ this.margin.left }, ${ this.margin.top - 10 })`)
            .call(axisTop(this.xScale).ticks(5));

        //    - Bottom axis
        this.svg
            .append('g')
            .attr('transform', `translate(${ this.margin.left }, ${ height - this.margin.bottom })`)
            .call(axisBottom(this.xScale).ticks(5));

        // 9) (Optional) A vertical line to track mouse
        this.line = this.svg
            .append('line')
            .attr('y1', this.margin.top - 10)
            .attr('y2', height - this.margin.bottom)
            .attr('stroke', 'rgba(0,0,0,0.2)')
            .style('pointer-events', 'none')
            .style('opacity', 0); // hidden by default

        // 10) Mousemove for line (and potential tooltip)
        this.svg.on('mousemove', (event) => {
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
