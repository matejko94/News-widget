import { Component, input, OnInit } from '@angular/core';
import { ForceData, ForceDirectedChartComponent, ForceLink, ForceNode } from '../../ui/charts/force-directed-chart/force-directed-chart.component';
import { MenuComponent } from '../../ui/menu/menu.component';
import { BasePage } from '../base.page';

@Component({
    selector: 'links-page',
    standalone: true,
    imports: [
        MenuComponent,
        ForceDirectedChartComponent,

    ],
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
            height: 100%;
        }
    `,
    template: `
        <div class="flex justify-end items-center w-full mt-3 mb-5 pr-4">
            <app-menu queryParam="topic" label="Indicator X" [options]="topicOptions()"/>
        </div>

        <app-force-directed-chart [data]="data" class="w-full flex-1 min-h-0"/>
    `
})
export default class LinksPage extends BasePage implements OnInit {
    public data = this.generateMockData();
    public year = input<number>();

    public override async ngOnInit() {
        super.ngOnInit();

        if (!this.topic()) {
            const [ firstTopic ] = this.topicOptions().map(({ value }) => value);
            await this.setQueryParam('topic', firstTopic);
        }
    }

    private generateMockData(nodeCount = 100, linkCount = 50): ForceData {
        const nodes: ForceNode[] = Array.from({ length: nodeCount }, (_, i) => ({
            id: i,
            group: Math.floor(Math.random() * 4) + 1
        }));

        const links: ForceLink[] = [];
        for (let i = 0; i < linkCount; i++) {
            let source = Math.floor(Math.random() * nodeCount);
            let target = Math.floor(Math.random() * nodeCount);

            while (target === source) {
                target = Math.floor(Math.random() * nodeCount);
            }

            links.push({
                source,
                target,
                value: Math.floor(Math.random() * 10) + 1
            });
        }

        return { nodes, links };


    }
}
