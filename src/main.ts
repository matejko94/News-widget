import {bootstrapApplication} from "@angular/platform-browser";
import {provideHttpClient, withJsonpSupport} from "@angular/common/http";
import {provideAnimations} from "@angular/platform-browser/animations";
import {AppComponent} from "./app.component";
import {provideRouter, withComponentInputBinding} from "@angular/router";
import {ROUTES} from "./routes";

bootstrapApplication(AppComponent, {
    providers: [
        provideHttpClient(withJsonpSupport()),
        provideRouter(ROUTES, withComponentInputBinding()),
        provideAnimations(),
    ]
}).catch(err => console.error(err));
