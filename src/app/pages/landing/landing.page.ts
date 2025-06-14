import { NgForOf } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SafeUrlPipe } from '../../common/pipe/safe-url.pipe';

@Component({
    selector: 'app-landing-page',
    imports: [
        NgForOf,
        SafeUrlPipe,
        FormsModule
    ],
    styles: `
        :host {
            display: block;
            width: 100%;
            height: 100%;
        }

        select {
            background: #f4f3f3;
            border-radius: 0.25rem;
            margin-top: 0.25rem;
            padding: 0.5rem 1rem;
            width: 100%;
        }
    `,
    template: `
        <div class="w-full mx-auto px-8">
            <div class="mb-4">
                <label for="sdg-select" class="block text-sm font-medium text-gray-700">Select SDG Number:</label>
                <select id="sdg-select" [(ngModel)]="selectedSdg" (change)="updateIframe()">
                    @for (sdg of getAvailableSdgs(); track sdg) {
                        <option [value]="sdg">{{ sdg === null ? 'No SDG' : 'SDG ' + sdg }}</option>
                    }
                </select>
            </div>
            <div class="mb-4">
                <label for="widget-select" class="block text-sm font-medium text-gray-700">Select Widget:</label>
                <select id="widget-select" [(ngModel)]="selectedWidget" (change)="onWidgetChange()">
                    <option *ngFor="let widget of widgetKeys" [value]="config.widgets[widget]">{{ widget }}</option>
                </select>
            </div>
            <div class="mb-4">
                <label for="environment-select" class="block text-sm font-medium text-gray-700">Select
                    Environment:</label>
                <select id="environment-select" [(ngModel)]="selectedEnvironment" (change)="updateIframe()">
                    <option *ngFor="let env of environmentKeys" [value]="config.environment[env]">{{ env }}</option>
                </select>
            </div>
            <iframe #iframe class="w-full h-[800px] border border-gray-300 rounded-md mx-auto mt-20"
                    [src]="currentUrl() | safeUrl"></iframe>
            <button (click)="copyUrl()"
                    class="block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mx-auto mt-6 w-fit">
                Copy URL
            </button>
            <button (click)="updateIframe()"
                    class="block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mx-auto mt-6 w-fit">
                Refresh
            </button>
        </div>
    `
})
export default class LandingPage {
    private readonly widgetsWithNoSdgOption = [
        '/education/radial',      // 3. Radial
        '/policy/heatmap',        // 4. Barcode
        '/policy/timeline',       // 5. Timeline
        '/innovations/collaboration', // 8. Collaboration
        '/education/links',       // 10. Links
        '/innovations/relations', // 11. Relations
    ];

    config: any = {
        sdgs: Array.from({ length: 18 }, (_, i) => i),
        widgets: {
            '1. News widget': '/news',
            '2. Sunburst': '/news/sunburst',
            '3. Radial': '/education/radial',
            '4. Barcode': '/policy/heatmap',
            '5. Timeline': '/policy/timeline',
            '6. Bubble': '/indicator/bubbles',
            '7. Intensity': '/news/intensity',
            '8. Collaboration': '/innovations/collaboration',
            '9. Evolution': '/science/evolution',
            '10. Links': '/education/links',
            '11. Relations': '/innovations/relations',
            '12. Radar': '/policy/radar'
        },
        environment: {
            'Local': 'http://localhost:4200',
            'Production': 'https://news-widget.pages.dev'
        }
    };
    public selectedSdg = signal(this.config.sdgs[1]);
    public selectedWidget = signal(Object.values(this.config.widgets)[0]);
    public selectedEnvironment = signal(Object.values((this.config.environment))[0]);
    public currentUrl = signal('');

    public ngOnInit() {
        this.updateIframe();
    }

    get widgetKeys() {
        return Object.keys(this.config.widgets);
    }

    get environmentKeys() {
        return Object.keys(this.config.environment);
    }

    getAvailableSdgs() {
        const currentWidget = this.selectedWidget() as string;
        
        if (this.widgetsWithNoSdgOption.includes(currentWidget)) {
            return [null, ...this.config.sdgs];
        }
        
        return this.config.sdgs;
    }

    updateIframe() {
        const sdgValue = this.selectedSdg();
        const sdgParam = (sdgValue !== null && sdgValue !== 'null') ? `?sdg=${sdgValue}` : '';
        this.currentUrl.set(`${this.selectedEnvironment()}${this.selectedWidget()}${sdgParam}`);
    }

    copyUrl() {
        navigator.clipboard.writeText(this.currentUrl());
    }

    onWidgetChange() {
        const currentWidget = this.selectedWidget() as string;
        
        if (this.widgetsWithNoSdgOption.includes(currentWidget)) {
            this.selectedSdg.set(null);
            
        } else if (this.selectedSdg() === null) {
            this.selectedSdg.set(this.config.sdgs[1]);
        }
        
        this.updateIframe();
    }
}
