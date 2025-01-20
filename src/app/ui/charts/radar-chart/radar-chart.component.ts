import { AfterViewInit, Component, ElementRef, input, viewChild } from '@angular/core';
import { curveLinearClosed, line, scaleLinear, select, Selection } from 'd3';
import { fromEvent } from 'rxjs';
import { debounceTime, startWith } from 'rxjs/operators';

export interface RadarChartData {
    axis: string;
    value: number;
}

@Component({
    selector: 'app-radar-chart',
    styles: [ `
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
    ` ],
    template: `
        <div #chartContainer class="w-full h-full flex flex-col items-center"></div>`
})
export class RadarChartComponent implements AfterViewInit {
    private chartContainer = viewChild.required<ElementRef>('chartContainer');
    public data = input.required<RadarChartData[]>();

    private margin = { top: 50, right: 50, bottom: 50, left: 50 };
    private svg!: Selection<SVGSVGElement, unknown, null, undefined>;
    private tooltip!: Selection<HTMLDivElement, unknown, null, undefined>;
    private radius = 0;
    private angleSlice = 0;
    private rScale!: ReturnType<typeof scaleLinear>;
    private chartGroup!: Selection<SVGGElement, unknown, null, undefined>;

    public ngAfterViewInit(): void {
        fromEvent(window, 'resize').pipe(
            debounceTime(10),
            startWith(null),
        ).subscribe(() => this.renderChart());

        setTimeout(() => this.renderChart(), 0);
    }

    private renderChart(): void {
        if (!this.data().length) return;

        const container = this.chartContainer().nativeElement;
        const { height, width } = container.getBoundingClientRect();
        const size = Math.min(height, width) * 0.8;

        this.clearChart(container);
        this.createSvg(container, size);
        this.createScales(size);
        this.createAxes();
        this.createTooltip(container);
        this.createRadarArea();
        this.createDots();
    }

    private clearChart(container: HTMLElement): void {
        container.innerHTML = '';
    }

    private createSvg(container: HTMLElement, size: number): void {
        this.svg = select(container)
            .append('svg')
            .attr('width', size + this.margin.left + this.margin.right)
            .attr('height', size + this.margin.top + this.margin.bottom);

        this.chartGroup = this.svg
            .append('g')
            .attr(
                'transform',
                `translate(${ (size / 2) + this.margin.left }, ${ (size / 2) + this.margin.top })`
            );
    }

    private createScales(size: number): void {
        const maxValue = Math.max(...this.data().map(d => d.value));
        this.radius = size / 2;
        this.angleSlice = (Math.PI * 2) / this.data().length;

        this.rScale = scaleLinear()
            .range([ 0, this.radius ])
            .domain([ 0, maxValue ]);
    }

    private createAxes(): void {
        const axisGrid = this.chartGroup
            .append('g')
            .attr('class', 'axisWrapper');

        axisGrid.selectAll('.levels')
            .data([ 1, 2, 3, 4, 5 ])
            .enter()
            .append('circle')
            .attr('class', 'gridCircle')
            .attr('r', d => this.radius / 5 * d)
            .style('fill', '#CDCDCD')
            .style('stroke', '#CDCDCD')
            .style('fill-opacity', 0.1);

        const axis = axisGrid.selectAll('.axis')
            .data(this.data())
            .enter()
            .append('g')
            .attr('class', 'axis');

        axis.append('line')
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', (d, i) => this.rScale(Math.max(...this.data().map(d => d.value))) as number * Math.cos(this.angleSlice * i - Math.PI / 2))
            .attr('y2', (d, i) => this.rScale(Math.max(...this.data().map(d => d.value))) as number * Math.sin(this.angleSlice * i - Math.PI / 2))
            .attr('class', 'line')
            .style('stroke', 'white')
            .style('stroke-width', '2px');

        axis.append('text')
            .attr('class', 'legend')
            .style('font-size', '11px')
            .attr('text-anchor', 'middle')
            .attr('dy', '0.35em')
            .attr('x', (d, i) => this.rScale(Math.max(...this.data().map(d => d.value)) * 1.1) as number * Math.cos(this.angleSlice * i - Math.PI / 2))
            .attr('y', (d, i) => this.rScale(Math.max(...this.data().map(d => d.value)) * 1.1) as number * Math.sin(this.angleSlice * i - Math.PI / 2))
            .attr('class', 'label')
            .text(d => d.axis);

        axisGrid.selectAll('.radialLabel')
            .data(this.rScale.ticks(5))
            .enter()
            .append('text')
            .attr('class', 'radialLabel')
            .attr('x', 0)
            .attr('y', d => -(this.rScale(d) as number))
            .attr('dy', '-0.4em')
            .style('text-anchor', 'middle')
            .style('font-size', '10px')
            .text(d => d);
    }

    private createTooltip(container: HTMLElement): void {
        this.tooltip = select(container)
            .append('div')
            .attr('class', 'tooltip')
            .style('opacity', 0);
    }

    private createRadarArea(): void {
        const radarLine = line<RadarChartData>()
            .x((d, i) => this.rScale(d.value)! as number * Math.cos(this.angleSlice * i - Math.PI / 2))
            .y((d, i) => this.rScale(d.value)! as number * Math.sin(this.angleSlice * i - Math.PI / 2))
            .curve(curveLinearClosed);

        this.chartGroup
            .append('path')
            .datum(this.data())
            .attr('d', radarLine)
            .style('fill', '#69b3a2')
            .style('fill-opacity', 0.5)
            .style('stroke', '#69b3a2')
            .style('stroke-width', '2px');
    }

    private createDots(): void {
        const showTooltip = (event: MouseEvent, d: RadarChartData) => {
            this.tooltip.transition().duration(200).style('opacity', 1);
            this.tooltip.html(`${ d.axis }<br>Value: ${ d.value }`)
                .style('left', `${ event.pageX + 15 }px`)
                .style('top', `${ event.pageY + 15 }px`);
        };

        const moveTooltip = (event: MouseEvent) => {
            this.tooltip
                .style('left', `${ event.pageX + 15 }px`)
                .style('top', `${ event.pageY + 15 }px`);
        };

        const hideTooltip = () => {
            this.tooltip.transition().duration(200).style('opacity', 0);
        };

        this.chartGroup
            .selectAll('.radarCircle')
            .data(this.data())
            .enter()
            .append('circle')
            .attr('class', 'radarCircle')
            .attr('r', 5)
            .attr('cx', (d, i) => this.rScale(d.value)! as number * Math.cos(this.angleSlice * i - Math.PI / 2))
            .attr('cy', (d, i) => this.rScale(d.value)! as number * Math.sin(this.angleSlice * i - Math.PI / 2))
            .style('fill', '#69b3a2')
            .style('fill-opacity', 0.8)
            .on('mouseover', showTooltip)
            .on('mousemove', moveTooltip)
            .on('mouseleave', hideTooltip);
    }
}
