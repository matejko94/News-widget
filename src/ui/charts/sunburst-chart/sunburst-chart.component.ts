import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
    ElementRef,
    inject,
    input,
    signal,
    viewChild
} from '@angular/core';
import {arc, hierarchy, HierarchyNode, HierarchyRectangularNode, partition, select, Selection} from "d3";
import {SunburstNode} from "./sunburst-node.interface";
import {debounceTime, fromEvent, startWith} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Component({
    selector: 'app-sunburst-chart',
    standalone: true,
    styles: `
      :host {
        display: flex;
        flex-direction: column;
        justify-items: center;
        align-items: center;
        width: 100%;
        height: 100%;
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
      }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="absolute top-0 left-0 flex gap-1 items-center mt-4 min-h-10 w-full">
            <ul class="flex">
                @for (node of hoveredSequence(); track node; let first = $first) {
                    <li class="px-2 py-1 text-white breadcrumb" [style.background-color]="getNodeColor(node)">
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
        <section class="flex items-center justify-center w-full mt-20 relative">
            <div #chartContainer class="flex justify-center flex-1">
                @if (activePercentage()) {
                    <div class="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 text-2xl
                        text-center text-gray-600 max-w-[30%] pr-16">
                        {{ activePercentage() }}
                        <br/>
                        of visits begin with this sequence of pages
                    </div>
                }
            </div>
            <ul class="flex flex-col gap-1 mt-4 p-2">
                @for (entry of legendEntries(); track entry) {
                    <li class="px-3 py-1 w-full text-xs sm:text-base text-center text-white rounded"
                        [style.background-color]="entry.color">
                        {{ entry.name }}
                    </li>
                }
            </ul>
        </section>
    `,
})
export class SunburstChartComponent implements AfterViewInit {
    private destroyRef = inject(DestroyRef);

    public chartContainer = viewChild.required<ElementRef<HTMLElement>>('chartContainer');
    public data = input.required<SunburstNode>();
    private colors = ["#5687d1", "#7b615c", "#de783b", "#6ab975", "#a173d1", "#bbbbbb"];
    public activePercentage = signal<string | undefined>(undefined);
    private totalSize = signal(0);
    private hoveredNode = signal<HierarchyNode<SunburstNode> | undefined>(undefined);
    public hoveredSequence = computed(() => this.hoveredNode() ? this.getAncestors(this.hoveredNode()!) : []);
    private topLevelNodes = signal<string[]>([]);
    public legendEntries = computed(() => this.topLevelNodes().map((name, i) => ({
        name,
        color: this.colors[i % this.colors.length]
    })));

    public ngAfterViewInit() {
        const element = this.chartContainer().nativeElement!;

        fromEvent(window, 'resize').pipe(
            startWith(null),
            debounceTime(25),
            takeUntilDestroyed(this.destroyRef),
        ).subscribe(() => this.renderChart(element.getBoundingClientRect().width * 0.8))
    }

    private renderChart(size: number): void {
        const root = hierarchy(this.data()).sum(d => d.size ?? 0);

        if (root.children) {
            this.topLevelNodes.set(root.children.map(c => c.data.name));
        }

        const radius = size / 2;

        select(this.chartContainer().nativeElement).select("svg").remove();
        const chart = select(this.chartContainer().nativeElement)
            .append("svg")
            .attr("width", size)
            .attr("height", size)
            .append("g")
            .attr("id", "container")
            .attr("transform", `translate(${radius},${radius})`);

        partition<SunburstNode>().size([2 * Math.PI, radius * radius])(root);

        chart.append("circle")
            .attr("r", radius)
            .style("opacity", 0);

        const paths: Selection<SVGPathElement, HierarchyNode<SunburstNode>, SVGGElement, unknown> = chart.selectAll("path")
            .data(root.descendants().filter((node: any) => (node.x1 - node.x0) > 0.005))
            .enter().append("path")
            .attr("display", d => d.depth ? null : "none")
            .attr("d", arc<HierarchyRectangularNode<SunburstNode>>()
                .startAngle(d => d.x0)
                .endAngle(d => d.x1)
                .innerRadius(d => Math.sqrt(d.y0))
                .outerRadius(d => Math.sqrt(d.y1)) as any
            )
            .style("fill", d => this.getNodeColor(d))
            .style("opacity", 1)
            .on("mouseover", (_, node) => this.mouseover(node, paths));

        select("#container").on("mouseleave", () => this.mouseleave(paths));

        this.totalSize.set(paths.datum().value ?? 0);
    }

    public getNodeColor(d: HierarchyNode<SunburstNode>): string {
        const ancestors = this.getAncestors(d);
        const topNode = ancestors.length > 0 ? ancestors[0] : d;
        const topNodeIndex = this.topLevelNodes().indexOf(topNode.data.name);
        return this.colors[topNodeIndex % this.colors.length] || "#ccc";
    }

    private mouseover(
        d: HierarchyNode<SunburstNode>,
        path: Selection<SVGPathElement, HierarchyNode<SunburstNode>, SVGGElement, unknown>
    ) {
        const percentage = (100 * (d.value ?? 0) / this.totalSize()).toPrecision(3);
        this.activePercentage.set(+percentage < 0.1 ? "< 0.1%" : percentage + "%");
        this.hoveredNode.set(d);

        const sequenceArray = this.getAncestors(d);
        path.style("opacity", 0.3);
        path.filter(node => sequenceArray.indexOf(node) >= 0).style("opacity", 1);
    }

    private mouseleave(path: Selection<SVGPathElement, HierarchyNode<SunburstNode>, SVGGElement, unknown>) {
        this.hoveredNode.set(undefined);
        this.activePercentage.set(undefined);

        path.on("mouseover", null);
        path.transition()
            .duration(200)
            .style("opacity", 1)
            .on("end", () => path.on("mouseover", (_, node) => this.mouseover(node, path)));
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
