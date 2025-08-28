import { computed, Directive, inject, Injector, input, OnInit, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { distinctUntilChanged, map, Observable } from 'rxjs';
import { WorldBankRegions } from '../../../configuration/regions/world-regions';
import { Configuration } from '../domain/configuration/service/configuration';
import { Topic } from '../domain/configuration/types/topic.interface';

@Directive()
export abstract class BasePage implements OnInit {
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private configuration = inject(Configuration);
    protected injector = inject(Injector);

    public sdg = input<string | undefined>();
    public pilot = input<string | undefined>();
    public topic = input<string>();
    public region = input<string>();
    public selectedRegion$ = toObservable(this.region);
    public regions = input([], { transform: (query: string | undefined) => query?.split(',') ?? [] });
    public availableTopics = signal<Topic[]>([]);
    public topicOptions = computed(() => this.availableTopics().map(t => ({ label: t.name, value: t.name })));
    public availableIndicators = signal<{ name: string }[]>([]);
    public indicatorOptions = computed(() => this.availableIndicators().map(i => ({ label: i.name, value: i.name })));
    public worldRegionOptions = WorldBankRegions;
    public selectedTopic$!: Observable<Topic>;

    public ngOnInit() {
        const sdgValue = this.sdg();
        const pilotValue = this.pilot();

        if (sdgValue) {
            const configuration = this.configuration.get(sdgValue);
            
            this.availableTopics.set(configuration.topics);
            this.availableIndicators.set(configuration.indicators);
        }else if (pilotValue) {
            const configuration = this.configuration.get(pilotValue);
            this.availableTopics.set(configuration.topics);
            this.availableIndicators.set(configuration.indicators);
        }

        this.selectedTopic$ = this.route.queryParamMap.pipe(
            map(params => params.get('topic')),
            distinctUntilChanged(),
            map(topic => {
                if (topic && this.availableTopics().some(t => t.name === topic)) {
                    return this.availableTopics().find(t => t.name === topic)!;
                } else {
                    return this.availableTopics()[0];
                }
            }),
        );
    }

    protected setQueryParam(key: string, value: string) {
        return this.router.navigate([], {
            queryParams: { [key]: value },
            queryParamsHandling: 'merge',
        });
    }
}
