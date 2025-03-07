import { Component, effect, input } from '@angular/core';
import {
    D3DragEvent,
    drag,
    forceCenter,
    forceCollide,
    forceLink,
    forceManyBody,
    forceSimulation,
    scaleOrdinal,
    schemeCategory10,
    select,
    Selection,
    Simulation,
} from 'd3';
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
            flex-direction: column;
            align-items: center;
            width: 100%;
            height: 100%;
        }

        .force-graph-container {
            width: 100%;
            height: 100%;
            position: relative;
        }

        svg {
            overflow: visible;
        }
    `,
    standalone: true,
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
export class ForceDirectedChartComponent extends Chart<ForceData> {
    public data = input.required<ForceData>();
    public tagLabel = input.required<string>();
    public legend = input<LegendItem[]>();

    private svg!: Selection<SVGSVGElement, unknown, null, unknown>;
    private colorScale = scaleOrdinal(schemeCategory10);
    private simulation!: Simulation<ForceNode, ForceLink>;
    private nodeRadius = 5;

    constructor() {
        super();
        effect(() => {
            this.data();
            this.renderChart();
        });
    }

    protected override renderChart(): void {
        const container = this.chartContainer().nativeElement;
        container.innerHTML = '';

        const { width, height } = container.getBoundingClientRect();

        this.createSvg(container, width, height);
        this.initializeSimulation(width, height);
        const links = this.drawLinks();
        const nodes = this.drawNodes();
        this.setupSimulationUpdates(height, width, links as any, nodes as any);
        const tooltip = createTooltip(container);
        registerTooltip(nodes as any, tooltip, container, (d: any) => `Node: ${ d.id }`);
        registerTooltip(links as any, tooltip, container, (d: any) => `Link: ${ d.source.id } - ${ d.target.id }`);
    }

    private createSvg(container: HTMLElement, width: number, height: number): void {
        this.svg = select(container)
            .append('svg')
            .attr('width', width)
            .attr('height', height);
    }

    private initializeSimulation(width: number, height: number): void {
        this.simulation = forceSimulation(this.data().nodes)
            .force('link', forceLink<ForceNode, ForceLink>(this.data().links).id(d => d.id).strength(0.1))
            .force('charge', forceManyBody().strength(-50))
            .force('center', forceCenter(width / 3, height / 3))
            .force('collide', forceCollide(this.nodeRadius * 2));
    }

    private drawLinks() {
        return this.svg
            .append('g')
            .selectAll('line')
            .data(this.data().links)
            .join('line')
            .attr('stroke', '#999')
            .attr('stroke-opacity', 0.6)
            .attr('stroke-width', d => Math.sqrt(d.value));
    }

    private drawNodes() {
        return this.svg
            .append('g')
            .selectAll('circle')
            .data(this.data().nodes)
            .join('circle')
            .attr('r', this.nodeRadius)
            .attr('fill', d => this.colorScale(d.group))
            .call(
                drag<SVGCircleElement, ForceNode>()
                    .on('start', this.dragStarted.bind(this))
                    .on('drag', this.dragged.bind(this))
                    .on('end', this.dragEnded.bind(this)) as any
            );
    }

    private setupSimulationUpdates(
        height: number,
        width: number,
        links: Selection<SVGLineElement, ForceLink, SVGGElement, unknown>,
        nodes: Selection<SVGCircleElement, ForceNode, SVGGElement, unknown>
    ): void {
        this.simulation.on('tick', () => {
            links
                .attr('x1', d => (d.source as ForceNode).x || 0)
                .attr('y1', d => (d.source as ForceNode).y || 0)
                .attr('x2', d => (d.target as ForceNode).x || 0)
                .attr('y2', d => (d.target as ForceNode).y || 0);

            nodes
                .attr('cx', d => {
                    d.x = d.x ?? 0;
                    d.x = Math.max(this.nodeRadius, Math.min(width - this.nodeRadius, d.x));
                    return d.x;
                })
                .attr('cy', d => {
                    d.y = d.y ?? 0;
                    d.y = Math.max(this.nodeRadius, Math.min(height - this.nodeRadius, d.y));
                    return d.y;
                });
        });
    }

    private dragStarted(event: D3DragEvent<SVGCircleElement, ForceNode, unknown>, d: ForceNode): void {
        if (!event.active) {
            this.simulation.alphaTarget(0.3).restart();
        }
        d.fx = d.x;
        d.fy = d.y;
    }

    private dragged(event: D3DragEvent<SVGCircleElement, ForceNode, unknown>, d: ForceNode): void {
        d.fx = event.x;
        d.fy = event.y;
    }

    private dragEnded(event: D3DragEvent<SVGCircleElement, ForceNode, unknown>, d: ForceNode): void {
        if (!event.active) {
            this.simulation.alphaTarget(0);
        }
        d.fx = null;
        d.fy = null;
    }
}
