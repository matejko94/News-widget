import { Component, computed, input, signal } from '@angular/core';
import { arc, Arc, Chord, chord, ChordGroup, Chords, descending, formatPrefix, ribbon, RibbonGenerator, select, Selection, sum, tickStep } from 'd3';
import { BoxLegendComponent } from '../../legend/box-legend.component';
import { Chart } from '../chart.abstract';
import { createTooltip, registerTooltip } from '../tooltip/tooltip';

export interface ChordChartData {
    matrix: number[][];
    names: string[];
    colors: string[];
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
            <app-box-legend [items]="legendItems()" horizontal/>
        </div>
    `
})
export class ChordChartComponent extends Chart {
    public data = input.required<ChordChartData>();
    public legendItems = computed(() => this.data().names.map((label, i) => ({
        label,
        color: this.data().colors[i],
        hidden: signal(false)
    })));
    private svg!: Selection<SVGSVGElement, unknown, null, undefined>;
    private tooltip!: Selection<HTMLDivElement, unknown, null, undefined>;

    protected renderChart(): void {
        const container = this.chartContainer().nativeElement;
        container.innerHTML = '';

        const { width, height } = container.getBoundingClientRect();
        console.log({ width, height });
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
        const outerRadius = size * 0.5 - 30;
        const innerRadius = outerRadius - 20;
        const total = sum(this.data().matrix.flat()) || 0;
        const step = tickStep(0, total, 100);
        const stepMajor = tickStep(0, total, 20);
        const formatValue = formatPrefix(',.0', step);
        const chordLayout = chord().padAngle(20 / innerRadius).sortSubgroups(descending);
        const chords: Chords = chordLayout(this.data().matrix);
        const arcGen: Arc<unknown, ChordGroup> = arc<ChordGroup>().innerRadius(innerRadius).outerRadius(outerRadius);
        const ribbonGen = ribbon<Chord, ChordGroup>().radius(innerRadius);
        this.createGroups(chords, arcGen, outerRadius, step, stepMajor, formatValue);
        const ribbons = this.createRibbons(chords, ribbonGen);
        this.registerTooltip(ribbons);
    }

    private createGroups(
        chords: Chords,
        arcGen: Arc<unknown, ChordGroup>,
        outerRadius: number,
        step: number,
        stepMajor: number,
        formatValue: (n: number) => string
    ): void {
        const group = this.svg
            .append('g')
            .selectAll('g')
            .data(chords.groups)
            .enter()
            .append('g');

        group
            .append('path')
            .attr('fill', (d: ChordGroup) => this.data().colors[d.index])
            .attr('d', arcGen)
            .each((d, i, nodes) => {
                registerTooltip(select(nodes[i]) as any, this.tooltip, this.chartContainer().nativeElement, () => {
                    return `${ d.value?.toLocaleString('en-US') } ${ this.data().names[d.index] }`;
                });
            });

        const groupTick = group
            .append('g')
            .selectAll('g')
            .data(d => this.groupTicks(d, step))
            .enter()
            .append('g')
            .attr('transform', (d) => `rotate(${ (d.angle * 180) / Math.PI - 90 }) translate(${ outerRadius },0)`);

        groupTick.append('line')
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

    private createRibbons(chords: Chords, ribbonGen: RibbonGenerator<any, Chord, ChordGroup>) {
        return this.svg
            .append('g')
            .attr('fill-opacity', 0.7)
            .selectAll('path')
            .data(chords)
            .enter()
            .append('path')
            .attr('d', ribbonGen as any)
            .attr('fill', d => this.data().colors[d.target.index])
            .attr('stroke', 'white')
    }

    private groupTicks(d: ChordGroup, step: number): GroupTick[] {
        const k = (d.endAngle - d.startAngle) / (d.value || 1);
        const count = Math.ceil((d.value || 0) / step);
        return Array.from({ length: count }, (_, i) => {
            const value = i * step;
            return { value, angle: value * k + d.startAngle };
        });
    }

    private registerTooltip(ribbons: Selection<SVGPathElement, Chord, SVGGElement, unknown>): void {
        ribbons.each((d, i, nodes) => {
            registerTooltip(select(nodes[i]) as any, this.tooltip, this.chartContainer().nativeElement, () => {
                const sourceVal = d.source.value?.toLocaleString('en-US');
                const targetVal = d.target.value?.toLocaleString('en-US');
                const sourceLabel = this.data().names[d.source.index];
                const targetLabel = this.data().names[d.target.index];
                return d.source.index !== d.target.index
                    ? `${ sourceVal } ${ sourceLabel } → ${ targetLabel }\n${ targetVal } ${ targetLabel } → ${ sourceLabel }`
                    : `${ sourceVal } ${ sourceLabel }`;
            });
        });
    }
}
