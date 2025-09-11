import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { map, Observable } from 'rxjs';
import { SDG_COLORS } from '../../../../configuration/colors/policy/sdg.colors';
import { ScienceService } from '../../domain/science/service/science.service';
import { TopTopicsPerYear } from '../../domain/science/types/topic-timespan.interface';
import { TimelineChartComponent, TimelineRow } from '../../ui/charts/timeline/timeline-chart.component';
import { PillLegendComponent } from '../../ui/components/legend/pill-legend.component';
import { SpinnerComponent } from '../../ui/components/spinner/spinner.component';
import { BasePage } from '../base.page';

@Component({
    selector: 'timeline-page',
    standalone: true,
    imports: [
        TimelineChartComponent,
        PillLegendComponent,
        SpinnerComponent
    ],
    styles: `
        :host {
            position: relative;
            display: flex;
            justify-items: center;
            align-items: center;
            width: 100%;
            height: 100%;
        }
    `,
    template: `
        <div class="flex flex-col-reverse md:flex-row justify-center items-center aspect-square w-full h-full relative">
            <app-pill-legend [items]="legend"/>
            <div class="flex-1 flex justify-center items-center w-full md:w-auto md:h-full">
                @if (allData().length > 0) {
                    @if (filteredData().length > 0) {
                        <app-timeline-chart [data]="filteredData()" [legend]="[]"/>
                    } @else {
                        <div class="flex items-center justify-center w-full h-full text-2xl text-gray-400">
                            No data available for selected SDGs
                        </div>
                    }
                } @else {
                    <app-spinner/>
                }
            </div>
        </div>
    `
})
export default class TimelinePage extends BasePage implements OnInit {
    private scienceService = inject(ScienceService);

    public selectedSdgs = signal<Set<number>>(new Set());
    public data$!: Observable<TimelineRow[]>;
    public filteredData = computed(() => {
        return this.allData().filter(row => {
            const selected = this.selectedSdgs();
            return selected.size === 0 || selected.has(row.sdg);
        });
    });
    
    public allData = signal<TimelineRow[]>([]);
    public sdgColors = SDG_COLORS.colors;
    public legend = this.sdgColors.map((color, index) => ({ 
        label: `SDG ${ index + 1 }`, 
        color,
        onClick: () => this.toggleSdgFilter(index + 1),
        isActive: computed(() => this.selectedSdgs().has(index + 1))
    }));

    public override ngOnInit() {
        super.ngOnInit();

        this.setupData().subscribe(data => {
            this.allData.set(data);
        });
    }

    private setupData(): Observable<TimelineRow[]> {
        const sdgValue = this.sdg();
        const pilotValue = this.pilot();
        
        if (pilotValue && pilotValue !== null) {
            return this.scienceService.getPilotTopTopicsPerYear(pilotValue, 15).pipe(
                map(years => this.mapTopicsToRows(years))
            );
        }

        return this.scienceService.getTopTopicsPerYear(sdgValue ? +sdgValue : undefined, 15).pipe(
            map(years => this.mapTopicsToRows(years))
        );
    }

    public toggleSdgFilter(sdg: number): void {
        const current = new Set(this.selectedSdgs());
        if (current.has(sdg)) {
            current.delete(sdg);
        } else {
            current.add(sdg);
        }
        this.selectedSdgs.set(current);
    }

    private mapTopicsToRows(years: TopTopicsPerYear[]): TimelineRow[] {
        const topicTopYears = new Map<string, number[]>();
        const topicSdg = new Map<string, number>();

        years.forEach(({ year, topics }) => {
            topics.forEach(({ key: topic, sdg }) => {
                if (!topicTopYears.has(topic)) {
                    topicTopYears.set(topic, []);
                }

                if (!topicSdg.has(topic)) {
                    topicSdg.set(topic, +(sdg.split(' ')[1]));
                }

                topicTopYears.get(topic)!.push(year);
            });
        });

        return Array.from(topicTopYears.entries())
            .map(([ name, topYears ]) => ({
                name,
                sdg: topicSdg.get(name)!,
                years: topYears.sort(),
                color: this.sdgColors[topicSdg.get(name)! - 1]
            }));
    }
}
