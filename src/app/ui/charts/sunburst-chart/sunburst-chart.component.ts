import { AfterViewInit, ChangeDetectorRef, Component, computed, DestroyRef, effect, ElementRef, inject, input, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { arc, hierarchy, HierarchyNode, HierarchyRectangularNode, partition, select, Selection } from 'd3';
import { debounceTime, fromEvent, startWith, } from 'rxjs';
import { LegendComponent } from '../../legend/legend.component';
import { SunburstNode } from './sunburst-node.interface';

@Component({
    selector: 'app-sunburst-chart',
    standalone: true,
    styles: `
        :host {
            display: flex;
            width: 100%;
            height: 100%;
            position: relative;
        }

        .chart path {
            stroke: #fff;
        }

        .breadcrumb {
            $clip-width: 4px;

            padding: 2px 20px;
            background-color: #666;
            color: white;
            display: inline-block;
            clip-path: polygon(0 0, calc(100% - $clip-width) 0, 100% 50%, calc(100% - $clip-width) 100%, 0 100%, $clip-width 50%);

            &:last-child {
                clip-path: polygon(0 0, 100% 0, 100% 50%, 100% 100%, 0 100%, $clip-width 50%);
                border-radius: 0 4px 4px 0;
            }

            &:first-child {
                clip-path: polygon(0 0, calc(100% - $clip-width) 0, 100% 50%, calc(100% - $clip-width) 100%, 0 100%);
                border-radius: 4px 0 0 4px;
            }

            @media (max-width: 768px) {
                font-size: 0.75rem;
                padding: 2px 10px;
            }
        }
    `,
    template: `
        <div class="absolute top-0 left-0 flex gap-1 items-center mt-2 min-h-10 w-full">
            <ul class="flex">
                @for (node of hoveredSequence(); track node; let first = $first) {
                    <li class="px-2 py-1 text-white breadcrumb" [style.background-color]="getNodeColor(node, colors())">
                        {{ node.data.name }}
                    </li>
                }
            </ul>
            @if (activePercentage()) {
                <div class="text-center text-gray-600">
                    {{ activePercentage() }}
                </div>
            }
        </div>
        <section class="flex flex-col md:flex-row items-center justify-center w-full h-full relative">
            <div #chartContainer class="flex justify-center items-center flex-1 max-md:w-full md:h-full relative">
                <div class="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2
                            text-sm md:text-base lg:text-lg xl:text-xl text-center text-gray-600 max-w-[30%]">
                    @if (activePercentage()) {
                        <span class="font-semibold text-lg lg:text-xl text-gray-500">{{ activePercentage() }}</span>
                        <br/>
                        of categories belong
                        <br/>
                        to this topic
                    }
                </div>
            </div>
            <app-legend [items]="topLevelNodes()" [colors]="colors()"/>
        </section>
    `,
    imports: [
        LegendComponent
    ]
})
export class SunburstChartComponent implements AfterViewInit {
    private destroyRef = inject(DestroyRef);
    private cdr = inject(ChangeDetectorRef);

    public chartContainer = viewChild.required<ElementRef<HTMLElement>>('chartContainer');
    public data = input.required<SunburstNode>();
    public colors = input.required<string[]>();
    public activePercentage = signal<string | undefined>(undefined);
    private totalSize = signal(0);
    private hoveredNode = signal<HierarchyNode<SunburstNode> | undefined>(undefined);
    public hoveredSequence = computed(() => this.hoveredNode() ? this.getAncestors(this.hoveredNode()!) : []);
    public topLevelNodes = computed(() => this.data().children?.map(d => d.name) ?? []);

    constructor() {
        effect(() => {
            if (this.data() && this.colors()) {
                this.renderChart(this.data(), this.colors());
            }
        });
    }

    public ngAfterViewInit(): void {
        fromEvent(window, 'resize').pipe(
            debounceTime(25),
            startWith(null),
            takeUntilDestroyed(this.destroyRef),
        ).subscribe(() => this.renderChart(this.data(), this.colors()));

        setTimeout(() => this.renderChart(this.data(), this.colors()), 0);
    }

    private renderChart(data: SunburstNode, colors: string[]): void {
        const chartEl = this.chartContainer().nativeElement;
        const { width, height } = chartEl.getBoundingClientRect();
        const size = Math.min(width, height) * 0.8;
        const root = hierarchy(data).sum(d => d.size ?? 0);

        const radius = size / 2;

        select(chartEl).select('svg').remove();
        const chart = select(chartEl)
            .append('svg')
            .attr('width', size)
            .attr('height', size)
            .append('g')
            .attr('id', 'container')
            .attr('transform', `translate(${ radius },${ radius })`);

        partition<SunburstNode>().size([ 2 * Math.PI, radius * radius ])(root);

        chart.append('circle')
            .attr('r', radius)
            .style('opacity', 0);

        const paths: Selection<SVGPathElement, HierarchyNode<SunburstNode>, SVGGElement, unknown> = chart
            .selectAll('path')
            .data(root.descendants().filter((node: any) => (node.x1 - node.x0) > 0.005))
            .enter().append('path')
            .attr('display', d => d.depth ? null : 'none')
            .attr('d', arc<HierarchyRectangularNode<SunburstNode>>()
                .startAngle(d => d.x0)
                .endAngle(d => d.x1)
                .innerRadius(d => Math.sqrt(d.y0))
                .outerRadius(d => Math.sqrt(d.y1)) as any
            )
            .style('fill', d => this.getNodeColor(d, colors))
            .style('opacity', 1)
            .on('mouseover', (_, node) => this.mouseover(node, paths));

        select('#container').on('mouseleave', () => this.mouseleave(paths));

        this.totalSize.set(paths.datum().value ?? 0);
        this.cdr.detectChanges();
    }

    public getNodeColor(d: HierarchyNode<SunburstNode>, colors: string[]): string {
        const ancestors = this.getAncestors(d);
        const topNode = ancestors.length > 0 ? ancestors[0] : d;
        const topNodeIndex = this.topLevelNodes().indexOf(topNode.data.name);
        return colors[topNodeIndex % colors.length] || '#ccc';
    }

    private mouseover(
        d: HierarchyNode<SunburstNode>,
        path: Selection<SVGPathElement, HierarchyNode<SunburstNode>, SVGGElement, unknown>
    ) {
        const percentage = (100 * (d.value ?? 0) / this.totalSize()).toPrecision(3);
        this.activePercentage.set(+percentage < 0.1 ? '< 0.1%' : percentage + '%');
        this.hoveredNode.set(d);

        const sequenceArray = this.getAncestors(d);
        path.style('opacity', 0.3);
        path.filter(node => sequenceArray.indexOf(node) >= 0).style('opacity', 1);
    }

    private mouseleave(path: Selection<SVGPathElement, HierarchyNode<SunburstNode>, SVGGElement, unknown>) {
        this.hoveredNode.set(undefined);
        this.activePercentage.set(undefined);

        path.on('mouseover', null);
        path.transition()
            .duration(300)
            .style('opacity', 1)
            .on('end', () => path.on('mouseover', (_, node) => this.mouseover(node, path)));
    }

    private getAncestors(node: HierarchyNode<SunburstNode>) {
        const path = [];
        let current = node;
        while (current.parent) {
            path.unshift(current);
            current = current.parent;
        }
        return path;
    }
}
