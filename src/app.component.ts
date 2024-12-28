import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";

@Component({
    selector: 'news-widget',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ RouterOutlet ],
    styles: `
      :host {
        display: block;
        width: 100%;
        height: 100%;
        padding: 0.25rem;
      }
    `,
    template: `<router-outlet/>`,
})
export class AppComponent {
    constructor() {
        console.log('Version: 1.0.0');
    }
}
