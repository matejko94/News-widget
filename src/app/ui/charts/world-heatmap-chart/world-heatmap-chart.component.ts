import { Component, effect, input } from '@angular/core';
import { geoMercator, geoPath, json, select, Selection } from 'd3';
import { FeatureCollection } from 'geojson';
import { feature } from 'topojson-client';
import { Chart } from '../chart.abstract';
import { createTooltip, registerTooltip } from '../tooltip/tooltip';

export interface WorldMapData {
    country: string;
    color: string;
    count: number;
}

@Component({
    selector: 'app-world-heatmap-chart',
    styles: [ `
        :host {
            display: block;
            width: 100%;
            position: relative;
            aspect-ratio: 3/1;
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
    template: `
        <div #chartContainer class="w-full h-full relative"></div>
    `
})
export class WorldMapComponent extends Chart {
    public data = input.required<WorldMapData[]>();
    public countLabel = input.required<string>();
    private dataPerCountry: Map<string, WorldMapData> = new Map();
    private svg!: Selection<SVGSVGElement, unknown, null, undefined>;
    private countriesGeo: FeatureCollection | null = null;

    constructor() {
        super();

        effect(() => {
            this.dataPerCountry.clear();
            this.data().forEach(country => this.dataPerCountry.set(country.country, country));
            this.renderChart();
        });
    }

    protected async renderChart() {
        const container = this.chartContainer().nativeElement;
        container.innerHTML = '';

        const { width, height } = container.getBoundingClientRect();

        this.createSvg(container, width, height);
        await this.loadGeoData();
        const countryPaths = this.drawMap(this.countriesGeo, width, height);
        this.addChartTooltip(container, countryPaths);
    }

    private createSvg(container: HTMLElement, width: number, height: number): void {
        this.svg = select(container)
            .append('svg')
            .attr('width', width)
            .attr('height', height);
    }

    private async loadGeoData() {
        if (!this.countriesGeo) {
            const geoJson: any = await json('/assets/world-geojson2.json');
            this.countriesGeo = feature(geoJson, geoJson.objects.countries) as unknown as FeatureCollection;
        }
    }

    private drawMap(geoJson: any, width: number, height: number) {
        const scaleValue = width / 12;
        const projection = geoMercator()
            .scale(scaleValue)
            .center([ 0, 40 ])
            .translate([ width / 2, height / 2 ]);
        // const projection = geoMercator()
        //     .scale(70)
        //     .center([ 0, 20 ])
        //     .translate([ width / 2, height / 2 ]);
        const pathGenerator = geoPath().projection(projection);

        return this.svg
            .append('g')
            .selectAll('path')
            .data(geoJson.features)
            .enter()
            .append('path')
            .attr('d', pathGenerator as any)
            .attr('fill', (feature: any) => this.dataPerCountry.get(feature.properties.name)?.color ?? '#ccc');
    }

    private addChartTooltip(
        container: HTMLElement,
        selection: Selection<SVGPathElement, unknown, SVGGElement, unknown>
    ): void {
        const tooltip = createTooltip(container);
        registerTooltip(selection, tooltip, container, (d: any) => {
            const country = d.properties?.name;
            const count = this.dataPerCountry.get(country)?.count ?? 0;
            return `
                Country: ${ country }<br/>
                ${ this.countLabel() }: ${ count }
            `;
        });
    }
}
