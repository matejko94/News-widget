import { ChangeDetectionStrategy, Component, effect, ElementRef, input, ViewChild } from '@angular/core';

@Component({
    selector: 'app-sentiment-meter',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <svg height="177px" viewBox="0 0 385 185" version="1.1" xmlns="http://www.w3.org/2000/svg">
            <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                <g id="Artboard" transform="translate(-15.000000, -224.000000)">
                    <g id="Group" transform="translate(15.000000, 220.000000)">
                        <g id="guage">
                            <path d="M84.8041871,178.856781 L84.8041871,179.169281 L25,179.169281 L25,178.669281 C25,119.519295 57.1931907,67.8894771 105.011512,40.3501901 L135,92.2989954 C105.009619,109.483749 84.8041871,141.810321 84.8041871,178.856781 Z"
                                  id="red" fill="#BD3632"></path>
                            <path d="M235.050803,92.4864742 C205.21439,75.1028089 167.169843,73.7652453 135.133157,92.2884751 L134.862916,92.4447251 L105,40.6455806 L105.432385,40.3955806 C156.58355,10.8205878 217.307001,12.8896752 265,40.5376689 L235.050803,92.4864742 L235.050803,92.4864742 Z"
                                  id="yellow" fill="#EEAF30"></path>
                            <path d="M235,92.2989954 L264.988488,40.3501901 C312.806809,67.8894771 345,119.519295 345,178.669281 L345,179.169281 L285.195813,179.169281 L285.195813,178.856781 C285.195813,141.810321 264.990381,109.483749 235,92.2989954 L235,92.2989954 Z"
                                  id="green" fill="#008542"></path>
                            <svg xmlns="http://www.w3.org/2000/svg" x="280" y="95" fill="white" height="36" width="36"
                                 viewBox="0 0 512 512">
                                <path d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm177.6 62.1C192.8 334.5 218.8 352 256 352s63.2-17.5 78.4-33.9c9-9.7 24.2-10.4 33.9-1.4s10.4 24.2 1.4 33.9c-22 23.8-60 49.4-113.6 49.4s-91.7-25.5-113.6-49.4c-9-9.7-8.4-24.9 1.4-33.9s24.9-8.4 33.9 1.4zM144.4 208a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm192-32a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/>
                            </svg>
                            <svg xmlns="http://www.w3.org/2000/svg" x="170" y="30" fill="white" height="36" width="36"
                                 viewBox="0 0 512 512">
                                <path d="M464 256A208 208 0 1 1 48 256a208 208 0 1 1 416 0zM256 0a256 256 0 1 0 0 512A256 256 0 1 0 256 0zM176.4 240a32 32 0 1 0 0-64 32 32 0 1 0 0 64zm192-32a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zM184 328c-13.3 0-24 10.7-24 24s10.7 24 24 24H328c13.3 0 24-10.7 24-24s-10.7-24-24-24H184z"/>
                            </svg>
                            <svg xmlns="http://www.w3.org/2000/svg" x="55" y="95" fill="white" height="36" width="36"
                                 viewBox="0 0 512 512">
                                <path d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zM174.6 384.1c-4.5 12.5-18.2 18.9-30.7 14.4s-18.9-18.2-14.4-30.7C146.9 319.4 198.9 288 256 288s109.1 31.4 126.6 79.9c4.5 12.5-2 26.2-14.4 30.7s-26.2-2-30.7-14.4C328.2 358.5 297.2 336 256 336s-72.2 22.5-81.4 48.1zM144.4 208a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm192-32a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/>
                            </svg>
                        </g>
                        <g id="needle" transform="translate(175.000000, 18.000000)">
                            <polygon #triangle fill="#3C3C3B" transform="rotate(90, 10, 162)"
                                     style="transition: all 500ms ease" points="10 0 15 162 5 162"></polygon>
                        </g>
                    </g>
                </g>
            </g>
        </svg>
    `
})
export class SentimentMeterComponent {
    @ViewChild('triangle') public el?: ElementRef<SVGPolygonElement>;

    value = input.required<number | null>();

    constructor() {
        effect(() => {
            const value = this.value() ?? 0;

            if (!this.el) {
                return;
            }

            this.el.nativeElement.style.transformOrigin = '10px 162px';
            this.el.nativeElement.style.transform = `rotate(${ value * 90 }deg)`;
        })
    }
}
