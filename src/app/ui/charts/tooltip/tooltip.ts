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
                .style('left', calculatePosition(event, tooltip, 'x') + 'px')
                .style('top', calculatePosition(event, tooltip, 'y') + 'px');
        })
        .on('mousemove', (event) => {
            tooltip
                .style('left', calculatePosition(event, tooltip, 'x') + 'px')
                .style('top', calculatePosition(event, tooltip, 'y') + 'px');
        })
        .on('mouseout', () => {
            tooltip.style('display', 'none');
        });

    function calculatePosition(
        event: MouseEvent,
        tooltipEl: Selection<HTMLDivElement, unknown, null, undefined>,
        axis: 'x' | 'y'
    ): number {
        const node = tooltipEl.node();
        if (!node) return 0;

        const {width, height} = node.getBoundingClientRect();
        const {left, top, width: containerWidth, height: containerHeight} =
            container.getBoundingClientRect();

        const clientOffset = axis === 'x' ? event.clientX : event.clientY;
        const containerOffset = axis === 'x' ? left : top;
        const containerSize = axis === 'x' ? containerWidth : containerHeight;
        const tooltipSize = axis === 'x' ? width : height;
        const offset = 10;

        const position = clientOffset - containerOffset + offset;

        if (position + tooltipSize > containerSize) {
            return containerSize - tooltipSize - offset;
        } else if (position < offset) {
            return offset;
        }

        return position;
    }
}
