import { select, Selection } from 'd3';

export function createTooltip(container: HTMLElement) {
    return select(container)
        .append('div')
        .attr('class', 'tooltip')
        .style('position', 'absolute')
        .style('pointer-events', 'none')
        .style('display', 'none')
        .style('left', '-9999px')
        .style('top', '-9999px');
}

export function registerTooltip<PathElement extends Element, Data, Series>(
    path: Selection<PathElement, Data, SVGElement, Series>,
    tooltip: Selection<HTMLDivElement, unknown, null, undefined>,
    container: HTMLElement,
    render: (d: Data, event: any) => string
) {
    path
        .on('mouseover', (event, d) => {
            tooltip
                .style('left', '-9999px')
                .style('top', '-9999px')
                .style('display', 'block')
                .html(render(d, event));

            tooltip
                .style('left', calculatePositionX(event, tooltip) + 'px')
                .style('top', calculatePositionY(event, tooltip) + 'px');
        })
        .on('mousemove', (event, d) => showTooltip(event, d))
        .on('mouseout', () => tooltip.style('display', 'none'));

    function showTooltip(event: MouseEvent, d: Data) {
        if (tooltip.style('display') !== 'block') {
            tooltip
                .style('left', '-9999px')
                .style('top', '-9999px')
                .style('display', 'block')
                .html(render(d, event));
        }

        tooltip
            .style('left', calculatePositionX(event, tooltip) + 'px')
            .style('top', calculatePositionY(event, tooltip) + 'px');
    }

    function calculatePositionY(
        event: MouseEvent,
        tooltipEl: Selection<HTMLDivElement, unknown, null, undefined>,
    ): number {
        const node = tooltipEl.node();
        if (!node) return 0;

        const offset = 10;
        const clientOffset = event.clientY;
        const tooltipHeight = node.getBoundingClientRect().height;
        const { top: containerOffset, height: containerHeight } = container.getBoundingClientRect();
        const position = clientOffset - containerOffset + offset;

        // overflow bottom
        if (position + tooltipHeight > containerHeight) {
            return containerHeight - tooltipHeight - offset;
        }

        // overflow top
        if (position < offset) {
            return offset;
        }

        return position;
    }

    function calculatePositionX(
        event: MouseEvent,
        tooltipEl: Selection<HTMLDivElement, unknown, null, undefined>,
    ): number {
        const tooltip = tooltipEl.node();
        if (!tooltip) return 0;

        const offset = 10;
        const clientOffset = event.clientX;
        const tooltipWidth = tooltip.getBoundingClientRect().width;
        const { left: containerLeft, width: containerWidth } = container.getBoundingClientRect();

        const position = clientOffset - containerLeft + offset;

        // overflow right
        if (position + tooltipWidth > containerWidth) {
            return containerWidth - tooltipWidth - offset;
        }

        // overflow left
        if (position < offset) {
            return offset;
        }

        return position;
    }
}
