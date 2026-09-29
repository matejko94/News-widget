import { select, Selection } from 'd3';

export function createTooltip(container: HTMLElement) {
    return select(container)
        .append('div')
        .attr('class', 'tooltip')
        .style('position', 'absolute')
        .style('display', 'none')
        .style('left', '-9999px')
        .style('top', '-9999px')
        .style('max-width', '70vw')
        .style('max-height', '50vh')
        .style('overflow', 'auto')
        .style('background', 'rgba(0, 0, 0, 0.8)')
        .style('color', '#fff')
        .style('padding', '8px')
        .style('border-radius', '4px')
        .style('box-shadow', '0 4px 6px rgba(0, 0, 0, 0.1)');
}

export function registerTooltip<PathElement extends Element, Data, Series>(
    path: Selection<PathElement, Data, SVGElement, Series>,
    tooltip: Selection<HTMLDivElement, unknown, null, undefined>,
    container: HTMLElement,
    render: (d: Data, event: any) => string
) {
    // d3 types the listener's event as `MouseEvent | CustomEvent<any>` (it cannot know which
    // typenames are pointer events), so narrow it here rather than relying on inference —
    // the exact shape differs between @types/d3-selection releases.
    path
        .on('mouseover', (event, d) => {
            const mouseEvent = event as MouseEvent;

            tooltip
                .style('left', '-9999px')
                .style('top', '-9999px')
                .style('display', 'block')
                .html(render(d, mouseEvent));

            tooltip
                .style('left', calculatePositionX(mouseEvent, container, tooltip) + 'px')
                .style('top', calculatePositionY(mouseEvent, container, tooltip) + 'px');
        })
        .on('mousemove', (event, d) =>
            showTooltip(event as MouseEvent, tooltip, container, render(d, event))
        )
        .on('mouseout', () => tooltip.style('display', 'none'));

}

function showTooltip(
    event: MouseEvent,
    tooltip: Selection<HTMLDivElement, unknown, null, undefined>,
    container: HTMLElement,
    html: string,
) {
    if (tooltip.style('display') !== 'block') {
        tooltip
            .style('left', '-9999px')
            .style('top', '-9999px')
            .style('display', 'block')
            .html(html);
    }

    tooltip
        .style('left', calculatePositionX(event, container, tooltip) + 'px')
        .style('top', calculatePositionY(event, container, tooltip) + 'px');
}

function calculatePositionY(
    event: MouseEvent,
    container: HTMLElement,
    tooltipEl: Selection<HTMLDivElement, unknown, null, undefined>
): number {
    const node = tooltipEl.node();
    if (!node) return 0;

    const offset = 10;
    const clientOffset = event.clientY;
    const tooltipHeight = node.getBoundingClientRect().height;
    const { top: containerOffset, height: containerHeight } = container.getBoundingClientRect();
    const position = clientOffset - containerOffset + offset;

    if (position + tooltipHeight > containerHeight) {
        return containerHeight - tooltipHeight - offset;
    }

    if (position < offset) {
        return offset;
    }

    return position;
}

function calculatePositionX(
    event: MouseEvent,
    container: HTMLElement,
    tooltipEl: Selection<HTMLDivElement, unknown, null, undefined>
): number {
    const tooltip = tooltipEl.node();
    if (!tooltip) return 0;

    const offset = 10;
    const clientOffset = event.clientX;
    const tooltipWidth = tooltip.getBoundingClientRect().width;
    const { left: containerLeft, width: containerWidth } = container.getBoundingClientRect();

    const position = clientOffset - containerLeft + offset;

    if (position + tooltipWidth > containerWidth) {
        return containerWidth - tooltipWidth - offset;
    }

    if (position < offset) {
        return offset;
    }

    return position;
}

