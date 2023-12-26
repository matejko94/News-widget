import { createApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { createCustomElement } from "@angular/elements";
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withJsonpSupport } from "@angular/common/http";
import { provideAnimations } from "@angular/platform-browser/animations";

const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withJsonpSupport()),
    provideAnimations()
  ]
};

(async () => {
  customElements.define('news-widget', createCustomElement(AppComponent, {
    injector: await createApplication(appConfig).then(({injector}) => injector)
  }));
})();
