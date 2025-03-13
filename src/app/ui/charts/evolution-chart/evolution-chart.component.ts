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
    selector: 'app-network-graph',
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
export class NetworkGraphComponent extends Chart<GraphData> {
    public data = input.required<GraphData>();
    public minEdgeSize = input<number>(2);
    public maxEdgeSize = input<number>(20);
    public minNodeSize = input<number>(5);
    public maxNodeSize = input<number>(20);
    public forceStrength = input<number>(-600);
    private simulation!: Simulation<GraphNode, GraphLink>;

    protected override renderChart(): void {
        const container = this.chartContainer().nativeElement;
        container.innerHTML = '';

        const { width, height } = container.getBoundingClientRect();
        if (!width || !height) return;

        const chartGroup = this.createSvg(container, width, height);

        if (!this.data().nodes.length) return;

        const linkSelection = this.drawLinks(chartGroup);
        const nodeGroupSelection = this.drawNodes(chartGroup);

        nodeGroupSelection.call(this.addDragBehavior());

        this.addTooltips(container, nodeGroupSelection.select('circle'), linkSelection);
        this.initForceSimulation(nodeGroupSelection, linkSelection, width, height);
    }

    private createSvg(container: HTMLElement, width: number, height: number) {
        return select(container)
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g');
    }

    private drawLinks(chart: Selection<SVGGElement, unknown, null, undefined>) {
        const weights = this.data().links.map(link => link.weight);
        const minWeightVal = Math.min(...weights);
        const maxWeightVal = Math.max(...weights);

        const edgeScale = scaleLinear()
            .domain([ minWeightVal, maxWeightVal ])
            .range([ this.minEdgeSize(), this.maxEdgeSize() ]);

        return chart
            .selectAll<SVGLineElement, GraphLink>('.link')
            .data(this.data().links)
            .enter()
            .append('line')
            .attr('class', 'link')
            .attr('stroke-width', d => edgeScale(d.weight));
    }

    private drawNodes(chart: Selection<SVGGElement, unknown, null, undefined>) {
        const radiusList = this.data().nodes.map(node => node.radius);
        const minRadius = Math.min(...radiusList);
        const maxRadius = Math.max(...radiusList);

        const radiusScale = scaleLinear()
            .domain([ minRadius, maxRadius ])
            .range([ this.minNodeSize(), this.maxNodeSize() ]);

        const nodeGroup = chart
            .selectAll('g.node-group')
            .data(this.data().nodes)
            .enter()
            .append('g')
            .attr('class', 'node-group');

        nodeGroup
            .append('circle')
            .attr('class', 'node')
            .attr('r', d => radiusScale(d.radius))
            .attr('fill', d => d.color);

        nodeGroup
            .append('text')
            .text(d => d.id)
            .attr('text-anchor', 'middle')
            .attr('dy', d => -(radiusScale(d.radius) + 4))
            .attr('font-size', '10px')
            .attr('fill', '#333');

        return nodeGroup;
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
        const tooltip = createTooltip(container);

        registerTooltip(nodeSelection, tooltip, container, d => {
            return `<strong>Topic:</strong> ${ d.id }<br>Total articles: ${ d.radius }`;
        });

        registerTooltip(linkSelection, tooltip, container, d => {
            return `<strong>Link:</strong> ${ (d.source as any).id } - ${ (d.target as any).id }<br>Shared articles: ${ d.weight }`;
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
            .on('tick', () => {
                linkSelection
                    .attr('x1', d => (d.source as any)?.x ?? 0)
                    .attr('y1', d => (d.source as any)?.y ?? 0)
                    .attr('x2', d => (d.target as any)?.x ?? 0)
                    .attr('y2', d => (d.target as any)?.y ?? 0);

                nodeGroupSelection.attr('transform', d => `translate(${ d.x ?? 0 }, ${ d.y ?? 0 })`);
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
