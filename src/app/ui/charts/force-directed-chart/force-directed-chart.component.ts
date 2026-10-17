import { Component, effect, input, output, untracked } from '@angular/core';
import { D3DragEvent, drag, forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation, scaleOrdinal, schemeCategory10, select, Selection, Simulation, } from 'd3';
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
    public fixedColor = input<string | undefined>();
    public legend = input<LegendItem[]>();
    // Id of the highlighted node. Owned by the page so it survives re-renders; the chart only
    // rings it and dims the rest.
    public selected = input<string | number | null>(null);
    // Emits the clicked node's id, or null when the selected node is clicked again (toggle off).
    public nodeSelect = output<string | number | null>();

    private svg!: Selection<SVGSVGElement, unknown, null, unknown>;
    private simulation!: Simulation<ForceNode, ForceLink>;
    private nodeRadius = 5;
    private nodes: Selection<SVGCircleElement, ForceNode, SVGGElement, unknown> | null = null;
    private links: Selection<SVGLineElement, ForceLink, SVGGElement, unknown> | null = null;

    constructor() {
        super();
        // Re-apply the highlight whenever the selection changes. Separate from renderChart so
        // clicking a node doesn't restart the simulation.
        effect(() => {
            this.selected();
            this.applyHighlight();
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
        this.nodes = nodes as any;
        this.links = links as any;
        untracked(() => this.applyHighlight());
        this.setupSimulationUpdates(height, width, links as any, nodes as any);
        const tooltip = createTooltip(container);
        registerTooltip(nodes as any, tooltip, container, (d: any) => `${ d.tag }<br><i>Click for details</i>`);
        registerTooltip(links as any, tooltip, container, (d: any) => `Source: ${ d.source.tag }<br>Target: ${ d.target.tag }<br>Shared sdgs: ${ d.value }`);
    }

    /** Ring the selected node and dim the rest, links included. No-op until the graph is drawn. */
    private applyHighlight() {
        if (!this.nodes || !this.links) return;

        const selected = this.selected();
        const hasSelection = selected !== null;
        const isEndpoint = (link: ForceLink) =>
            (link.source as ForceNode).id === selected || (link.target as ForceNode).id === selected;

        this.nodes
            .attr('r', d => d.id === selected ? this.nodeRadius * 1.8 : this.nodeRadius)
            .attr('stroke', d => d.id === selected ? '#111827' : null)
            .attr('stroke-width', d => d.id === selected ? 2 : null)
            .attr('opacity', d => !hasSelection || d.id === selected ? 1 : 0.35);
        this.links.attr('stroke-opacity', d => !hasSelection ? 0.6 : isEndpoint(d) ? 0.9 : 0.15);
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
            .force('charge', forceManyBody().strength(-350))
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
            .attr('fill', d => this.fixedColor() || d.color)
            .style('cursor', 'pointer')
            // d3-drag swallows the click that ends a real drag, so dragging doesn't select.
            .on('click', (_event, d) => this.nodeSelect.emit(d.id === this.selected() ? null : d.id))
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

    private dragEnded(event: D3DragEvent<SVGCircleElement, ForceNode, unknown>): void {
        if (!event.active) {
            this.simulation.alphaTarget(0);
        }
    }
}
