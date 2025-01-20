import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

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
        }
    `,
    template: `<router-outlet/>`,
})
export class AppComponent {
    constructor() {
        console.log('Version: 1.0.2');
    }
}
