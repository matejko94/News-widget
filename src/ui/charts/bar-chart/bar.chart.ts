import { AfterViewInit, Component, input } from '@angular/core';
import Chart from 'chart.js/auto';
import { DataService } from "../../../utils/data.service";

@Component({
    selector: 'app-barchart',
    template: `
        <div class="flex items-center w-full h-full">
            <canvas id="BarChart">{{ chart }}</canvas>
        </div>`,
    standalone: true,
    styles: [ `
      :host {
        display: block;
        height: 100%;
      }
    ` ]
})
export class BarchartComponent implements AfterViewInit {

    constructor(private dataService: DataService) {
    }

    sdg = input.required<string>();

    public chart: any;

    public ngAfterViewInit() {
        this.createChart();
    }

    createChart() {
        this.dataService.getMediaByCountryCount(this.sdg()).subscribe(response => {
            const labelArray: String[] = [];
            const dataArray: number[] = [];
            for (const data of response) {
                dataArray.push(data.doc_count)
                labelArray.push(data.key)
            }

            this.chart = new Chart("BarChart", {
                type: 'bar',
                data: {
                    labels: labelArray,
                    datasets: [
                        {
                            label: "number of news ...",
                            data: dataArray,
                            backgroundColor: "rgba(146, 193, 192, 0.7)",
                        }
                    ]
                },
                options: {
                    plugins: {
                        title: {
                            display: true,
                            text: "SDG News Exposure",
                            font: {
                                size: 14,
                                weight: 'bold',
                            }
                        },
                        legend: {
                            display: true,
                            position: 'bottom',
                            labels: {
                                font: {
                                    size: 14,
                                }
                            }
                        },
                    },
                    scales: {
                        x: {
                            grid: {
                                display: false // Hide X-axis grid lines for cleaner look
                            },
                            ticks: {
                                font: {
                                    size: 14
                                }
                            }
                        },
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(0, 0, 0, 0.1)', // Add a light grey color to Y-axis grid lines
                            },
                            ticks: {
                                font: {
                                    size: 14
                                },
                            },
                            min: 0, // Adjust this as necessary to fit your data
                            max: Math.max(...dataArray) * 1 // Add some padding at the top
                        }
                    }
                }
            });

        })

    }
}
