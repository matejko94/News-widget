import { Component, computed, input, signal } from '@angular/core';
import { arc, Arc, chord, Chord, ChordGroup, Chords, descending, formatPrefix, ribbon, RibbonGenerator, select, Selection, sum, tickStep } from 'd3';
import { BoxLegendComponent } from '../../components/legend/box-legend.component';
import { Chart } from '../chart.abstract';
import { createTooltip, registerTooltip } from '../tooltip/tooltip';

export interface ChordChartData {
    links: {
        source: {
            group: string;
            subGroup: string;
        };
        target: {
            group: string;
            subGroup: string;
        };
        commonValues: string[];
    }[];
    groups: {
        name: string;
        color: string;
    }[];
}

interface GroupTick {
    value: number;
    angle: number;

}

@Component({
    selector: 'app-chord-chart',
    styles: [ `
        :host {
            display: block;
            width: 100%;
            position: relative;
        }

        .tooltip {
            position: absolute;
            text-align: center;
            width: auto;
            height: auto;
            padding: 8px;
            font: 12px sans-serif;
            background: black;
            color: white;
            border-radius: 4px;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.2s;
        }
    ` ],
    imports: [
        BoxLegendComponent
    ],
    template: `
        <div class="flex flex-col justify-center items-center aspect-square w-full h-full relative">
            <div #chartContainer class="flex-1 w-full flex justify-center items-center relative"></div>
            <app-box-legend [items]="legendItems()" horizontal></app-box-legend>
        </div>
    `
})
export class ChordChartComponent extends Chart {
    public data = input.required<ChordChartData>();

    public legendItems = computed(() =>
        this.data().groups.map((g) => ({
            label: g.name,
            color: g.color,
            hidden: signal(false)
        }))
    );

    private svg!: Selection<SVGSVGElement, unknown, null, undefined>;
    private tooltip!: Selection<HTMLDivElement, unknown, null, undefined>;

    private linkIndexMetadata = new Map<string, {
        sourceGroup: string;
        sourceSubGroup: string;
        targetGroup: string;
        targetSubGroup: string;
        commonValues: string[];
    }[]>();

    protected renderChart(): void {
        const container = this.chartContainer().nativeElement;
        container.innerHTML = '';

        const { width, height } = container.getBoundingClientRect();
        const size = Math.min(width, height);

        this.createSvg(container, size);
        this.tooltip = createTooltip(container);
        this.drawChord(size);
    }

    private createSvg(container: HTMLElement, size: number): void {
        this.svg = select(container)
            .append('svg')
            .attr('width', size)
            .attr('height', size)
            .attr('viewBox', [ -size / 2, -size / 2, size, size ])
            .style('font', '10px sans-serif');
    }

    private drawChord(size: number): void {
        const matrix = this.buildMatrix();

        const outerRadius = size * 0.5 - 30;
        const innerRadius = outerRadius - 20;
        const total = sum(matrix.flat()) || 0;
        const step = tickStep(0, total, 100);
        const stepMajor = tickStep(0, total, 20);
        const formatValue = formatPrefix(',.0', step);

        const chordLayout = chord()
            .padAngle(20 / innerRadius)
            .sortSubgroups(descending);

        const chords: Chords = chordLayout(matrix);
        const arcGen: Arc<unknown, ChordGroup> =
            arc<ChordGroup>().innerRadius(innerRadius).outerRadius(outerRadius);
        const ribbonGen: RibbonGenerator<any, Chord, ChordGroup> =
            ribbon<Chord, ChordGroup>().radius(innerRadius);

        this.createGroups(chords, arcGen, outerRadius, step, stepMajor, formatValue);
        const ribbons = this.createRibbons(chords, ribbonGen);
        this.registerLinkTooltip(ribbons);
    }

    private buildMatrix(): number[][] {
        const { groups, links } = this.data();
        const nameToIndex = new Map<string, number>();
        groups.forEach((g, i) => nameToIndex.set(g.name, i));

        const matrix = Array.from({ length: groups.length }, () => Array(groups.length).fill(0));

        for (const link of links) {
            const sIdx = nameToIndex.get(link.source.group);
            const tIdx = nameToIndex.get(link.target.group);

            if (sIdx === undefined || tIdx === undefined) {
                continue;
            }

            const value = link.commonValues.length;
            matrix[sIdx][tIdx] += value;
            matrix[tIdx][sIdx] += value;

            const pairKey = sIdx <= tIdx
                ? `${ sIdx }-${ tIdx }`
                : `${ tIdx }-${ sIdx }`;

            const existingData = this.linkIndexMetadata.get(pairKey) || [];
            existingData.push({
                sourceGroup: link.source.group,
                sourceSubGroup: link.source.subGroup,
                targetGroup: link.target.group,
                targetSubGroup: link.target.subGroup,
                commonValues: link.commonValues
            });
            this.linkIndexMetadata.set(pairKey, existingData);
        }

        return matrix;
    }

    private createGroups(
        chords: Chords,
        arcGen: Arc<unknown, ChordGroup>,
        outerRadius: number,
        step: number,
        stepMajor: number,
        formatValue: (n: number) => string
    ): void {
        const groupSelection = this.svg
            .append('g')
            .selectAll('g')
            .data(chords.groups)
            .enter()
            .append('g');

        groupSelection
            .append('path')
            .attr('fill', (d: ChordGroup) => this.data().groups[d.index].color)
            .attr('d', arcGen)
            .each((d, i, nodes) => {
                registerTooltip(
                    select(nodes[i]) as any,
                    this.tooltip,
                    this.chartContainer().nativeElement,
                    () => this.groupTooltipContent(d)
                );
            });

        const groupTick = groupSelection
            .append('g')
            .selectAll('g')
            .data(d => this.groupTicks(d, step))
            .enter()
            .append('g')
            .attr('transform', d => `rotate(${ (d.angle * 180) / Math.PI - 90 }) translate(${ outerRadius },0)`);

        groupTick
            .append('line')
            .attr('stroke', 'currentColor')
            .attr('x2', 6);

        groupTick
            .filter(d => d.value % stepMajor === 0)
            .append('text')
            .attr('x', 8)
            .attr('dy', '.35em')
            .attr('transform', d => (d.angle > Math.PI ? 'rotate(180) translate(-16)' : null))
            .attr('text-anchor', d => (d.angle > Math.PI ? 'end' : null))
            .text(d => formatValue(d.value));
    }

    private createRibbons(
        chords: Chords,
        ribbonGen: RibbonGenerator<any, Chord, ChordGroup>
    ): Selection<SVGPathElement, Chord, SVGGElement, unknown> {
        return this.svg
            .append('g')
            .attr('fill-opacity', 0.7)
            .selectAll('path')
            .data(chords)
            .enter()
            .append('path')
            .attr('d', ribbonGen as any)
            .attr('fill', d => this.data().groups[d.target.index].color)
            .attr('stroke', 'white');
    }

    private groupTooltipContent(d: ChordGroup): string {
        const group = this.data().groups[d.index];
        return `Group: ${ group.name }<br>Total Links: ${ d?.value ?? 0 }`;
    }

    private linkTooltipContent(d: Chord): string {
        if (d.source.index === d.target.index) {
            const gName = this.data().groups[d.source.index].name;
            const val = d.source.value?.toLocaleString('en-US') ?? '0';
            return `Self link for ${ gName }<br>Connections: ${ val }`;
        }

        const commonCounts = new Map<string, number>();
        const pairKey = d.source.index <= d.target.index
            ? `${ d.source.index }-${ d.target.index }`
            : `${ d.target.index }-${ d.source.index }`;

        const linkDetails = this.linkIndexMetadata.get(pairKey);
        if (!linkDetails || linkDetails.length === 0) {
            return 'No subGroup details';
        }

        linkDetails.forEach((item) => {
            item.commonValues.forEach((val) => commonCounts.set(val, (commonCounts.get(val) || 0) + 1));
        });

        const lines = linkDetails.map((item) => {
            return `${ item.sourceSubGroup } → ${ item.targetSubGroup } |
            common: [${ item.commonValues.join(', ') }]
      `;
        });

        return [
            `Connections between ${ linkDetails.length } subGroups`,
            ...lines
        ].join('<hr/>');
    }

    private registerLinkTooltip(
        ribbons: Selection<SVGPathElement, Chord, SVGGElement, unknown>
    ): void {
        ribbons.each((d, i, nodes) => {
            // registerTooltip(
            //     select(nodes[i]) as any,
            //     this.tooltip,
            //     this.chartContainer().nativeElement,
            //     () => this.linkTooltipContent(d)
            // );
        });
    }

    private groupTicks(d: ChordGroup, step: number): GroupTick[] {
        const k = (d.endAngle - d.startAngle) / (d.value || 1);
        const count = Math.ceil((d.value || 0) / step);
        return Array.from({ length: count }, (_, i) => {
            const value = i * step;
            return { value, angle: value * k + d.startAngle };
        });
    }
}
