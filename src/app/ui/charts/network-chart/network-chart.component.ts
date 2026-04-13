import { Component, input } from '@angular/core';
import { drag, forceCenter, forceLink, forceManyBody, forceSimulation, scaleLinear, select, Selection, Simulation, SimulationLinkDatum, SimulationNodeDatum } from 'd3';
import { Chart } from '../chart.abstract';
import { createTooltip, registerTooltip } from '../tooltip/tooltip';

export interface GraphNode extends SimulationNodeDatum {
    id: string;
    color: string;
    radius: number;
}

export interface GraphLink extends SimulationLinkDatum<GraphNode> {
    source: string;
    target: string;
    weight: number;
}

export interface GraphData {
    nodes: GraphNode[];
    links: GraphLink[];
}

@Component({
    selector: 'app-network-chart',
    styles: [
        `
            :host {
                display: block;
                width: 100%;
                aspect-ratio: 3/2;

                ::ng-deep {
                    svg {
                        overflow: visible;
                    }

                    .link {
                        stroke: #999;
                        stroke-opacity: 0.5;
                    }

                    .node {
                        stroke: #333;
                        stroke-width: 1;
                        cursor: pointer;
                        opacity: 0.6;
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
        `
    ],
    template: `
        <div class="flex justify-center items-center h-full w-full relative">
            <div #chartContainer class="relative h-full w-full"></div>
        </div>
    `
})
export class NetworkChartComponent extends Chart<GraphData> {
    public data = input.required<GraphData>();
    public minEdgeSize = input<number>(2);
    public maxEdgeSize = input<number>(20);
    public minNodeSize = input<number>(5);
    public maxNodeSize = input<number>(20);
    public forceStrength = input<number>(-600);
    private nodeGroups!: Selection<SVGGElement, GraphNode, SVGGElement, unknown>;
    private links!: Selection<SVGLineElement, GraphLink, SVGGElement, unknown>;
    private simulation!: Simulation<GraphNode, GraphLink>;
    private tooltip!: Selection<HTMLDivElement, any, any, any>;

    protected override renderChart(): void {
        const container = this.chartContainer().nativeElement;

        const { width, height } = container.getBoundingClientRect();
        if (!width || !height) return;

        const chartGroup = this.createSvg(container, width, height);

        if (!this.tooltip) {
            this.tooltip = createTooltip(container);
        }

        if (!this.data().nodes.length) return;

        this.links = this.updateLinks(chartGroup);
        this.nodeGroups = this.updateNodes(chartGroup, this.data().nodes);
        this.nodeGroups.call(this.addDragBehavior());
        this.addTooltips(container, this.nodeGroups.select('circle'), this.links);
        this.initForceSimulation(this.nodeGroups, this.links, width, height);
    }

    private createSvg(container: HTMLElement, width: number, height: number) {
        const svg = select(container).select<SVGSVGElement>('svg').node()
            ? select(container).select<SVGSVGElement>('svg')
            : select(container).append('svg');

        svg
            .attr('width', width)
            .attr('height', height)

        return svg.select<SVGGElement>('g.chart-group').empty()
            ? svg.append('g').attr('class', 'chart-group')
            : svg.select<SVGGElement>('g.chart-group');
    }

    private updateLinks(chart: Selection<SVGGElement, unknown, null, undefined>) {
        const weights = this.data().links.map(link => link.weight);
        const edgeScale = scaleLinear()
            .domain([Math.min(...weights), Math.max(...weights)])
            .range([this.minEdgeSize(), this.maxEdgeSize()]);

        const linkSelection = chart.selectAll<SVGLineElement, GraphLink>('.link')
            .data(this.data().links, link => {
                // @ts-ignore
                const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
                // @ts-ignore
                const targetId = typeof link.target === 'object' ? link.target.id : link.target;
                return `${sourceId}-${targetId}`;
            });

        linkSelection.exit().remove();

        const linkEnter = linkSelection.enter()
            .append('line')
            .attr('class', 'link')
            .attr('stroke-width', 0);

        const mergedLinks = linkEnter.merge(linkSelection);
        mergedLinks
            .transition()
            .duration(750)
            .attr('stroke-width', d => edgeScale(d.weight));

        return mergedLinks;
    }

    private updateNodes(chart: Selection<SVGGElement, unknown, null, undefined>, nodes: GraphNode[]) {
        const radiusList = nodes.map(node => node.radius);
        const radiusScale = scaleLinear()
            .domain([Math.min(...radiusList), Math.max(...radiusList)])
            .range([this.minNodeSize(), this.maxNodeSize()]);

        const nodeSelection = chart.selectAll<SVGGElement, GraphNode>('g.node-group')
            .data(nodes, d => d.id);

        const nodeEnter = nodeSelection.enter()
            .append('g')
            .attr('class', 'node-group');

        nodeEnter.append('circle')
            .attr('class', 'node')
            .attr('r', d => radiusScale(d.radius))
            .attr('fill', d => d.color);

        nodeEnter.append('text')
            .attr('text-anchor', 'middle')
            .attr('font-size', '10px')
            .attr('fill', '#333')
            .text(d => d.id);

        const mergedNodes = nodeEnter.merge(nodeSelection);

        // Update both text position AND circle color on data change
        mergedNodes.select('text')
            .transition()
            .duration(750)
            .attr('dy', d => -(radiusScale(d.radius) + 4));

        mergedNodes.select('circle')
            .transition()
            .duration(750)
            .attr('fill', d => d.color);

        nodeSelection.exit().remove();

        return mergedNodes;
    }

    private addDragBehavior() {
        return drag<SVGGElement, GraphNode>()
            .on('start', (event, d) => {
                if (!event.active) {
                    this.simulation.alphaTarget(0.3).restart();
                }

                d.fx = d.x;
                d.fy = d.y;
            })
            .on('drag', (event, d) => {
                d.fx = event.x;
                d.fy = event.y;
            })
            .on('end', (event, d) => {
                if (!event.active) {
                    this.simulation.alphaTarget(0.1);
                }

                d.fx = d.x;
                d.fy = d.y;
            });
    }

    private addTooltips(
        container: HTMLElement,
        nodeSelection: Selection<SVGCircleElement, GraphNode, SVGGElement, unknown>,
        linkSelection: Selection<SVGLineElement, GraphLink, SVGGElement, unknown>
    ): void {
        registerTooltip(nodeSelection, this.tooltip, container, d => {
            return `<strong>Topic:</strong> ${d.id}<br>Total articles: ${d.radius}`;
        });

        registerTooltip(linkSelection, this.tooltip, container, d => {
            return `<strong>Link:</strong> ${(d.source as any).id} - ${(d.target as any).id}<br>Shared articles: ${d.weight}`;
        });
    }

    private initForceSimulation(
        nodeGroupSelection: Selection<SVGGElement, GraphNode, SVGGElement, unknown>,
        linkSelection: Selection<SVGLineElement, GraphLink, SVGGElement, unknown>,
        width: number,
        height: number
    ): void {
        const { nodes, links } = this.data();

        this.simulation = forceSimulation<GraphNode>(nodes)
            .force('link', forceLink<GraphNode, GraphLink>(links).id(d => d.id))
            .force('charge', forceManyBody().strength(this.forceStrength()))
            .force('center', forceCenter(width / 2, height / 2))
            .force(
                'isolate',
                this.isolateUnlinkedNodesForce(nodes, links, width / 2, height / 2, 0.1)
            )
            .alphaDecay(0.01)
            .on('tick', () => {
                linkSelection
                    .attr('x1', d => (d.source as any)?.x ?? 0)
                    .attr('y1', d => (d.source as any)?.y ?? 0)
                    .attr('x2', d => (d.target as any)?.x ?? 0)
                    .attr('y2', d => (d.target as any)?.y ?? 0);

                nodeGroupSelection.attr('transform', d => `translate(${d.x ?? 0}, ${d.y ?? 0})`);
            });

        this.simulation.alpha(1).restart();
    }

    private isolateUnlinkedNodesForce(
        nodes: GraphNode[],
        links: GraphLink[],
        centerX: number,
        centerY: number,
        strength: number = 0.05
    ) {
        const linkCount = new Map<string, number>();
        nodes.forEach(node => linkCount.set(node.id, 0));
        links.forEach(link => {
            linkCount.set(String(link.source), (linkCount.get(String(link.source)) || 0) + 1);
            linkCount.set(String(link.target), (linkCount.get(String(link.target)) || 0) + 1);
        });

        return (alpha: number) => {
            for (const node of nodes) {
                if (!linkCount.get(node.id)) {
                    const vx = (centerX - (node.x ?? 0)) * strength * alpha;
                    const vy = (centerY - (node.y ?? 0)) * strength * alpha;
                    node.vx = (node.vx || 0) + vx;
                    node.vy = (node.vy || 0) + vy;
                }
            }
        };
    }
}
