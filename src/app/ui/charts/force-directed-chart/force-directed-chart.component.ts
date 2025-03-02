import { Component, effect, input } from '@angular/core';
import { select, Selection, forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide, drag, scaleOrdinal, schemeCategory10, D3DragEvent, Simulation } from 'd3';
import { LegendItem, PillLegendComponent } from '../../components/legend/pill-legend.component';
import { Chart } from '../chart.abstract';

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
    styles: [
        `
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
        `
    ],
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
export class ForceDirectedChartComponent extends Chart {
    public data = input.required<ForceData>();
    public tagLabel = input.required<string>();
    public legend = input<LegendItem[]>();

    private svg!: Selection<SVGSVGElement, unknown, null, unknown>;
    private colorScale = scaleOrdinal(schemeCategory10);
    private simulation!: Simulation<ForceNode, ForceLink>;

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
        // @ts-ignore
        this.setupSimulationUpdates(links, nodes);
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
            .force('center', forceCenter(width / 2.5, height / 2.5))
            .force('collide', forceCollide(15));
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
        const nodes = this.svg
            .append('g')
            .selectAll('circle')
            .data(this.data().nodes)
            .join('circle')
            .attr('r', 5)
            .attr('fill', d => this.colorScale(d.group))
            // @ts-ignore
            .call(drag<SVGCircleElement, ForceNode>()
                .on('start', this.dragStarted.bind(this))
                .on('drag', this.dragged.bind(this))
                .on('end', this.dragEnded.bind(this))
            );

        nodes.append('title').text(d => d.id.toString());
        return nodes;
    }

    private setupSimulationUpdates(links: Selection<SVGLineElement, ForceLink, SVGGElement, unknown>, nodes: Selection<SVGCircleElement, ForceNode, SVGGElement, unknown>): void {
        this.simulation.on('tick', () => {
            links
                .attr('x1', d => (d.source as ForceNode).x || 0)
                .attr('y1', d => (d.source as ForceNode).y || 0)
                .attr('x2', d => (d.target as ForceNode).x || 0)
                .attr('y2', d => (d.target as ForceNode).y || 0);

            nodes
                .attr('cx', d => d.x || 0)
                .attr('cy', d => d.y || 0);
        });
    }

    private dragStarted(event: D3DragEvent<SVGCircleElement, ForceNode, unknown>, d: ForceNode): void {
        if (!event.active) this.simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    private dragged(event: D3DragEvent<SVGCircleElement, ForceNode, unknown>, d: ForceNode): void {
        d.fx = event.x;
        d.fy = event.y;
    }

    private dragEnded(event: D3DragEvent<SVGCircleElement, ForceNode, unknown>, d: ForceNode): void {
        if (!event.active) this.simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
}
