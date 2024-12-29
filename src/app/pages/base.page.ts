import { computed, Directive, inject, Injector, input, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { distinctUntilChanged, map, Observable, tap } from 'rxjs';
import { Configuration } from '../domain/configuration/service/configuration';
import { Topic } from '../domain/configuration/types/topic.interface';

@Directive()
export abstract class BasePage implements OnInit {
    private route = inject(ActivatedRoute);
    private configuration = inject(Configuration);

    public sdg = input.required<string>();
    public topic = input.required<string>();
    public availableTopics = signal<Topic[]>([]);
    public topicOptions = computed(() => this.availableTopics().map(t => t.name));
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
}
