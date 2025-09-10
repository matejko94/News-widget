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
                <select id="sdg-select" [(ngModel)]="selectedSdg" (change)="onSdgChange()">
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
            <!-- Select for pilot -->
            <div class="mb-4">
                <label for="pilot-select" class="block text-sm font-medium text-gray-700">Select Pilot:</label>
                <select id="pilot-select" [(ngModel)]="selectedPilot" (change)="onPilotChange()">
                    @for (pilot of getAvailablePilots(); track pilot) {
                        <option [value]="pilot">{{ pilot === null ? 'No Pilot' : pilot }}</option>
                    }
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
        '/science/evolution',       // 9. Evolution
        '/innovations/relations', // 11. Relations
        '/policy/radar',          // 12. Radar
        '/indicator/bubbles',      // 6. Bubble
        '/news/sunburst',         // 2. Sunburst
        '/news',                  // 1. News widget
        '/news/intensity',        // 7. Intensity
        '/innovations/collaboration', // 8. Collaboration
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
        },
        pilots: {
            'COP30': 'COP30',
            'ELIAS': 'ELIAS',
            'Lanslides': 'Lanslides',
            'OER 1': 'OER 1',
            'OER 2': 'OER 2',
            'OER 3': 'OER 3',
            'OER 4': 'OER 4',
            'OER 5': 'OER 5',
            'AImovement': 'AImovement',
            'RaD': 'RaD',
            'Quantum': 'Quantum'
        }
    };

    public selectedSdg = signal(this.config.sdgs[1]);
    public selectedWidget = signal(Object.values(this.config.widgets)[0]);
    public selectedEnvironment = signal(Object.values((this.config.environment))[0]);
    public currentUrl = signal('');
    public selectedPilot = signal(null);

    public ngOnInit() {
        this.updateIframe();
    }

    get widgetKeys() {
        return Object.keys(this.config.widgets);
    }

    get pilotKeys() {
        return Object.keys(this.config.pilots);
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

    getAvailablePilots() {
        return [null, ...Object.values(this.config.pilots)];
    }

    updateIframe() {
        const sdgValue = this.selectedSdg();
        const pilotValue = this.selectedPilot();
        
        let queryParams = [];
        
        if (sdgValue !== null && sdgValue !== 'null') {
            queryParams.push(`sdg=${sdgValue}`);
        }
        
        if (pilotValue && pilotValue !== null) {
            queryParams.push(`pilot=${pilotValue}`);
        }
        
        const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
        this.currentUrl.set(`${this.selectedEnvironment()}${this.selectedWidget()}${queryString}`);
    }

    onPilotChange() {
        //set sdg to null if pilot is selected
        this.selectedSdg.set(null);
        this.updateIframe();
    }

    onSdgChange() {
        //set pilot to null if sdg is selected
        this.selectedPilot.set(null);
        this.updateIframe();
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
