import {select, Selection, Series, SeriesPoint} from "d3";

export function createTooltip(container: HTMLElement) {
    return select(container)
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
}

export function registerTooltip(
    path: Selection<SVGPathElement, SeriesPoint<any>, SVGElement, Series<any, unknown>>,
    tooltip: Selection<HTMLDivElement, unknown, null, undefined>,
    render: (d: SeriesPoint<any>, event: any) => string
) {
    path
        .on("mouseover", (event, d) => {
            tooltip.transition().duration(200).style("opacity", 1);
            tooltip.html(render(d, event))
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY + 10) + "px");
        })
        .on("mousemove", (event) => {
            tooltip
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY + 10) + "px");
        })
        .on("mouseout", () => {
            tooltip.transition().duration(200).style("opacity", 0);
        });
}