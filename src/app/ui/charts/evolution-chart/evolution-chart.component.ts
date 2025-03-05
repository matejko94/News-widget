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
    styles: [ `
        :host {
            display: block;
            width: 100%;
            aspect-ratio: 2/1;

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
    ` ],
    template: `
        <div class="flex justify-center items-center h-full w-full relative">
            <div #chartContainer class="relative h-full w-full"></div>
        </div>
    `
})
export class NetworkGraphComponent extends Chart {
    public data = input.required<GraphData>();
    public minEdgeSize = input<number>(2);
    public maxEdgeSize = input<number>(20);
    public minNodeSize = input<number>(5);
    public maxNodeSize = input<number>(20);
    public forceStrength = input<number>(-200);
    private simulation!: Simulation<GraphNode, GraphLink>;

    protected override renderChart(): void {
        const container = this.chartContainer().nativeElement;
        container.innerHTML = '';

        const { width, height } = container.getBoundingClientRect();
        if (!width || !height) return;

        const chartGroup = this.createSvg(container, width, height);

        if (!this.data().nodes.length) return;

        const linkSelection = this.drawLinks(chartGroup);
        const nodeSelection = this.drawNodes(chartGroup);
        nodeSelection.call(this.addDragBehavior());
        this.addTooltips(container, nodeSelection, linkSelection);
        this.initForceSimulation(nodeSelection, linkSelection, width, height);
    }

    private createSvg(container: HTMLElement, width: number, height: number) {
        return select(container)
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
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

        return chart
            .selectAll<SVGCircleElement, GraphNode>('.node')
            .data(this.data().nodes)
            .enter()
            .append('circle')
            .attr('class', 'node')
            .attr('r', d => radiusScale(d.radius))
            .attr('fill', d => d.color);
    }

    private addDragBehavior() {
        return drag<SVGCircleElement, GraphNode>()
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
                    this.simulation.alphaTarget(0);
                }
                d.fx = null;
                d.fy = null;
            });
    }

    private addTooltips(
        container: HTMLElement,
        nodeSelection: Selection<SVGCircleElement, GraphNode, SVGGElement, unknown>,
        linkSelection: Selection<SVGLineElement, GraphLink, SVGGElement, unknown>
    ): void {
        const tooltip = createTooltip(container);

        registerTooltip(nodeSelection, tooltip, container, (d) => {
            return `<strong>Topic:</strong> ${ d.id }<br>Total articles: ${ d.radius }`;
        });

        registerTooltip(linkSelection, tooltip, container, (d) => {
            return `<strong>Link:</strong> ${ (d.source as any).id } - ${ (d.target as any).id }<br>Shared articles: ${ d.weight }`;
        });
    }

    private initForceSimulation(
        nodeSelection: Selection<SVGCircleElement, GraphNode, SVGGElement, unknown>,
        linkSelection: Selection<SVGLineElement, GraphLink, SVGGElement, unknown>,
        width: number,
        height: number
    ): void {
        const { nodes, links } = this.data();
        this.simulation = forceSimulation<GraphNode>(nodes)
            .force('link', forceLink<GraphNode, GraphLink>(links).id(d => d.id))
            .force('charge', forceManyBody().strength(this.forceStrength()))
            .force('center', forceCenter(width / 2, height / 2))
            .on('tick', () => {
                linkSelection
                    .attr('x1', d => (d.source as any)?.x ?? 0)
                    .attr('y1', d => (d.source as any)?.y ?? 0)
                    .attr('x2', d => (d.target as any)?.x ?? 0)
                    .attr('y2', d => (d.target as any)?.y ?? 0);

                nodeSelection
                    .attr('cx', d => d.x ?? 0)
                    .attr('cy', d => d.y ?? 0);
            });
        this.simulation.alpha(1).restart();
    }
}
