import { select, Selection, Series, SeriesPoint } from 'd3';

export function createTooltip(container: HTMLElement) {
    return select(container)
        .append('div')
        .attr('class', 'tooltip')
        .style('display', 'none');
}

export function registerTooltip(
    path: Selection<SVGPathElement, SeriesPoint<any>, SVGElement, Series<any, unknown>>,
    tooltip: Selection<HTMLDivElement, unknown, null, undefined>,
    container: HTMLElement,
    render: (d: SeriesPoint<any>, event: any) => string
) {
    path
        .on('mouseover', (event, d) => {
            tooltip.transition().duration(200).style('display', 'block');
            tooltip.html(render(d, event))
                .style('left', calculatePosition(event, tooltip, 'x') + 'px')
                .style('top', calculatePosition(event, tooltip, 'y') + 'px');
        })
        .on('mousemove', (event) => {
            tooltip
                .style('left', calculatePosition(event, tooltip, 'x') + 'px')
                .style('top', calculatePosition(event, tooltip, 'y') + 'px');
        })
        .on('mouseout', () => {
            tooltip.transition().duration(200).style('display', 'none');
        });

    function calculatePosition(
        event: MouseEvent,
        tooltip: Selection<HTMLDivElement, unknown, null, undefined>,
        axis: 'x' | 'y'
    ): number {
        const tooltipNode = tooltip.node();
        if (!tooltipNode) return 0;

        const { width, height } = tooltipNode.getBoundingClientRect();
        const { left, top, width: containerWidth, height: containerHeight } = container.getBoundingClientRect();
        const clientOffset = axis === 'x' ? event.clientX : event.clientY; // Relative to viewport
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
