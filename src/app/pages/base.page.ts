import { computed, Directive, inject, Injector, input, OnInit, signal } from '@angular/core';
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

    public sdg = input.required<string>();
    public topic = input<string>();
    public region = input<string>();
    public regions = input<string[]>();
    public availableTopics = signal<Topic[]>([]);
    public topicOptions = computed(() => this.availableTopics().map(t => ({ label: t.name, value: t.name })));
    public worldRegionOptions = WorldBankRegions;
    public selectedTopic$!: Observable<Topic>;

    public ngOnInit() {
        this.availableTopics.set(this.configuration.getTopics(this.sdg()).topics);

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
