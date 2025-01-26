import { Component, input } from '@angular/core';
import { D3DragEvent, drag, forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation, forceX, forceY, scaleOrdinal, schemeCategory10, select, Selection, Simulation } from 'd3';
import { Chart } from '../chart.abstract';
import { createTooltip, registerTooltip } from '../tooltip/tooltip';

export interface ForceNode {
    id: string | number;
    group: number;
    x?: number;
    y?: number;
    fx?: number | null;
    fy?: number | null;
}

export interface ForceLink {
    source: string | number | ForceNode;
    target: string | number | ForceNode;
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
    template: `
        <div #chartContainer class="w-full h-full"></div>
    `
})
export class ForceDirectedChartComponent extends Chart {
    public data = input.required<ForceData>();

    private svg!: Selection<SVGSVGElement, unknown, null, undefined>;
    private tooltip!: Selection<HTMLDivElement, unknown, null, undefined>;
    private simulation!: Simulation<ForceNode, ForceLink>;
    private color = scaleOrdinal(schemeCategory10);

    protected override renderChart(): void {
        if (!this.data().nodes.length || !this.data().links.length) {
            return;
        }

        const container = this.chartContainer().nativeElement;
        container.innerHTML = '';
        const { width, height } = container.getBoundingClientRect();
        const size = Math.min(width, height) * 0.8;

        this.createSvg(container, size);
        this.tooltip = createTooltip(container);

        this.simulation = forceSimulation<ForceNode>(this.data().nodes)
            .force(
                'link',
                forceLink<ForceNode, ForceLink>(this.data().links)
                    .id(d => d.id)
                    .distance(80)
                    .strength(0.7)
            )
            .force('charge', forceManyBody().strength(-30))
            .force('center', forceCenter(0, 0))
            .force('x', forceX())
            .force('y', forceY())
            .force('collide', forceCollide<ForceNode>().radius(20));

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
        this.svg
            .append('g')
            .attr('stroke', '#999')
            .attr('stroke-opacity', 0.6)
            .selectAll('line')
            .data(this.data().links)
            .enter()
            .append('line')
            .attr('stroke-width', d => Math.sqrt(d.value))
            .attr('class', 'link');
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
            .attr('fill', d => this.color(d.group.toString()))
            .call(
                drag<SVGCircleElement, ForceNode>()
                    .on('start', event => this.dragStarted(event))
                    .on('drag', event => this.dragged(event))
                    .on('end', event => this.dragEnded(event))
            );

        registerTooltip(nodes, this.tooltip, container, d => d.id.toString());
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
}
