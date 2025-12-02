import { computed, Directive, inject, Injector, input, OnInit, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, distinctUntilChanged, filter, map, Observable, startWith, tap } from 'rxjs';
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
        // Update availableTopics and availableIndicators when sdg or pilot changes
        combineLatest([
            toObservable(this.sdg, { injector: this.injector }),
            toObservable(this.pilot, { injector: this.injector })
        ]).pipe(
            tap(([sdgValue, pilotValue]) => {
                console.log('BasePage - updating topics for sdg:', sdgValue, 'pilot:', pilotValue);
                if (sdgValue) {
                    const configuration = this.configuration.get(sdgValue);
                    console.log('BasePage - SDG configuration topics:', configuration.topics);
                    this.availableTopics.set(configuration.topics);
                    this.availableIndicators.set(configuration.indicators);
                } else if (pilotValue) {
                    const configuration = this.configuration.get(pilotValue);
                    console.log('BasePage - Pilot configuration topics:', configuration.topics);
                    this.availableTopics.set(configuration.topics);
                    this.availableIndicators.set(configuration.indicators);
                }
            })
        ).subscribe();

        this.selectedTopic$ = combineLatest([
            this.route.queryParamMap.pipe(
                map(params => params.get('topic')),
                distinctUntilChanged()
            ),
            toObservable(this.availableTopics, { injector: this.injector }).pipe(
                startWith(this.availableTopics()),
                filter(topics => topics.length > 0)
            )
        ]).pipe(
            map(([topic, availableTopics]) => {
                console.log('BasePage - selectedTopic$ - topic param:', topic, 'availableTopics:', availableTopics);
                if (topic && availableTopics.some(t => t.name === topic)) {
                    const selected = availableTopics.find(t => t.name === topic)!;
                    console.log('BasePage - selectedTopic$ - found topic:', selected, 'wikiConcepts:', selected.wikiConcepts);
                    return selected;
                } else {
                    const first = availableTopics[0];
                    console.log('BasePage - selectedTopic$ - using first topic:', first, 'wikiConcepts:', first?.wikiConcepts);
                    return first;
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
