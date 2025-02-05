import { Component, input } from '@angular/core';
import { D3DragEvent, drag, forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation, forceX, forceY, select, Selection, Simulation } from 'd3';
import { LegendItem, PillLegendComponent } from '../../components/legend/pill-legend.component';
import { Chart } from '../chart.abstract';
import { createTooltip, registerTooltip } from '../tooltip/tooltip';

export interface ForceNode {
    id: string | number;
    group: string;
    tag: string;
    totalLinks: number;
    color: string;
    x?: number;
    y?: number;
    fx?: number | null;
    fy?: number | null;
}

export interface ForceLink {
    source: string | number | ForceNode;
    target: string | number | ForceNode;
    link: string;
    value: number;
}

export interface ForceData {
    nodes: ForceNode[];
    links: ForceLink[];
}

@Component({
    selector: 'app-force-directed-chart',
    styles: `
        :host {
            display: flex;
            width: 100%;
            overflow: hidden;

            ::ng-deep svg {
                overflow: visible;
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
    `,
    imports: [
        PillLegendComponent
    ],
    template: `
        <div class="flex flex-col md:flex-row justify-center items-center aspect-square w-full h-full relative">
            <div #chartContainer
                 class="flex-1 w-full md:w-auto md:h-full flex justify-center items-center relative"></div>
            @if (legend(); as legend) {
                <app-pill-legend [items]="legend"/>
            }
        </div>
    `
})
export class ForceDirectedChartComponent extends Chart {
    public data = input.required<ForceData>();
    public tagLabel = input.required<string>();
    public legend = input<LegendItem[]>();

    private svg!: Selection<SVGSVGElement, unknown, null, undefined>;
    private tooltip!: Selection<HTMLDivElement, unknown, null, undefined>;
    private simulation!: Simulation<ForceNode, ForceLink>;

    protected override renderChart(): void {
        if (!this.data().nodes.length || !this.data().links.length) {
            return;
        }

        const container = this.chartContainer().nativeElement;
        container.innerHTML = '';
        const { width, height } = container.getBoundingClientRect();
        const size = Math.min(width, height) * 0.8;

        // Build the SVG and tooltip
        this.createSvg(container, size);
        this.tooltip = createTooltip(container);

        // Build a force simulation that clusters nodes by their 'group'
        this.simulation = this.createGroupedSimulation(this.data(), size);

        this.createLinks();
        this.createNodes(container);

        this.simulation.on('tick', () => this.onTick());
    }

    private createSvg(container: HTMLElement, size: number): void {
        this.svg = select(container)
            .append('svg')
            .attr('width', size)
            .attr('height', size)
            .attr('viewBox', [ -size / 2, -size / 2, size, size ].join(' '))
            .style('max-width', '100%')
            .style('height', 'auto');
    }

    private createLinks(): void {
        // const filteredLinks = this.data().links.filter(link => {
        //     const src = typeof link.source === 'object' ? link.source : this.data().nodes.find(n => n.id === link.source)!;
        //     const tgt = typeof link.target === 'object' ? link.target : this.data().nodes.find(n => n.id === link.target)!;
        //     return src.group === tgt.group;
        // })

        const links = this.svg
            .append('g')
            .attr('stroke', '#999')
            .attr('stroke-opacity', 0.6)
            .selectAll('line')
            .data(this.data().links)
            .enter()
            .append('line')
            .attr('stroke-width', d => Math.sqrt(d.value))
            .attr('class', 'link');

        registerTooltip(links, this.tooltip, this.chartContainer().nativeElement, d => {
            return `Node: ${ (d.source as ForceNode).id }<br>`
                + `Node: ${ (d.target as ForceNode).id }<br>`
                + `Link: ${ d.link }`;
        });
    }

    private createNodes(container: HTMLElement): void {
        const nodes = this.svg
            .append('g')
            .attr('stroke', '#fff')
            .attr('stroke-width', 1.5)
            .selectAll('circle')
            .data(this.data().nodes)
            .enter()
            .append('circle')
            .attr('r', 5)
            .attr('fill', d => d.color)
            .call(
                drag<SVGCircleElement, ForceNode>()
                    .on('start', event => this.dragStarted(event))
                    .on('drag', event => this.dragged(event))
                    .on('end', event => this.dragEnded(event))
            );

        registerTooltip(nodes, this.tooltip, container, d => {
            return `Node: ${ d.id }<br>${ this.tagLabel() }: ${ d.tag }<br>Links: ${ d.totalLinks }`;
        });
    }

    private onTick(): void {
        select(this.svg.node())
            .selectAll<SVGLineElement, ForceLink>('line.link')
            .attr('x1', d => (d.source as ForceNode).x!)
            .attr('y1', d => (d.source as ForceNode).y!)
            .attr('x2', d => (d.target as ForceNode).x!)
            .attr('y2', d => (d.target as ForceNode).y!);

        select(this.svg.node())
            .selectAll<SVGCircleElement, ForceNode>('circle')
            .attr('cx', d => d.x!)
            .attr('cy', d => d.y!);
    }

    private dragStarted(event: D3DragEvent<SVGCircleElement, ForceNode, ForceNode>): void {
        if (!event.active) {
            this.simulation.alphaTarget(0.3).restart();
        }
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
    }

    private dragged(event: D3DragEvent<SVGCircleElement, ForceNode, ForceNode>): void {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
    }

    private dragEnded(event: D3DragEvent<SVGCircleElement, ForceNode, ForceNode>): void {
        if (!event.active) {
            this.simulation.alphaTarget(0);
        }
        event.subject.fx = null;
        event.subject.fy = null;
    }

    private createGroupedSimulation(data: ForceData, size: number): Simulation<ForceNode, ForceLink> {
        // 1) Gather all unique groups
        const uniqueGroups = Array.from(new Set(data.nodes.map(node => node.group)));

        // 2) Assign a center for each group in a circle
        const radius = size / 3;
        const groupCenterMap = new Map<string, { x: number; y: number }>();
        uniqueGroups.forEach((grp, i) => {
            const angle = (2 * Math.PI * i) / uniqueGroups.length;
            groupCenterMap.set(grp, {
                x: radius * Math.cos(angle),
                y: radius * Math.sin(angle),
            });
        });

        // Optionally filter out cross-group links:
        // const filteredLinks = data.links.filter(link => {
        //     const src = typeof link.source === 'object' ? link.source : data.nodes.find(n => n.id === link.source)!;
        //     const tgt = typeof link.target === 'object' ? link.target : data.nodes.find(n => n.id === link.target)!;
        //     return src.group === tgt.group;
        // });

        return forceSimulation<ForceNode>(data.nodes)
            // Use either data.links or filteredLinks below
            .force(
                'link',
                forceLink<ForceNode, ForceLink>(data.links)
                    .id(d => d.id)
                    .distance(80)
                    .strength(0.7)
            )
            // Stronger negative charge to push groups apart
            .force('charge', forceManyBody().strength(-80))
            // Keep entire graph in the center
            .force('center', forceCenter(0, 0))
            // Force each node toward its group's center
            .force(
                'x',
                forceX<ForceNode>()
                    .x(d => groupCenterMap.get(d.group)!.x)
                    .strength(0.4) // increase for tighter grouping
            )
            .force(
                'y',
                forceY<ForceNode>()
                    .y(d => groupCenterMap.get(d.group)!.y)
                    .strength(0.4)
            )
            // Prevent overlap among nodes
            .force('collide', forceCollide<ForceNode>().radius(25));
    }
}
