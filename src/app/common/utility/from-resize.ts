import { Observable } from 'rxjs';

export function fromResize(element: HTMLElement) {
    return new Observable(observer => {
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                observer.next(entry.contentRect);
            }
        });
        resizeObserver.observe(element);

        return () => resizeObserver.unobserve(element);
    });
}
