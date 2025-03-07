import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';

@Component({
    selector: 'news-widget',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ RouterOutlet ],
    styles: `
        :host {
            display: block;
            max-width: 1080px;
            margin: auto;
            width: 100%;
            height: 100%;
            position: relative;
        }
    `,
    template: `<router-outlet/>`,
})
export class AppComponent {
    private route = inject(ActivatedRoute);

    constructor() {
        this.route.queryParams.subscribe(params => {
            console.log('Query params:', params);
        });
    }
}
