import { AfterViewInit, Component, input } from "@angular/core";
import Chart from 'chart.js/auto';
import { DataService } from "../../utils/data.service";

@Component({
    selector: 'app-piechart',
    standalone: true,
    template: `
        <div class="w-4/5 mx-auto">
            <canvas id="PieChart">{{ chart }}</canvas>
        </div>
    `

})
export class PieChartComponent implements AfterViewInit {
    constructor(private dataService: DataService) {
    }

    sdg = input.required<string>();

    public chart: any;

    public ngAfterViewInit() {
        this.createChart();
    }

    createChart() {
        this.dataService.getInnovations(this.sdg()).subscribe(response => {
            const labelArray: String[] = [];
            const dataArray: number[] = [];
            for (const data of response) {
                dataArray.push(data.doc_count)
                labelArray.push(data.key)
            }
            this.chart = new Chart("PieChart", {
                type: 'pie',
                // type: 'doughnut',
                data: {
                    labels: labelArray,
                    datasets: [ {
                        label: 'Top 5 countries by innovation',
                        data: dataArray,
                        backgroundColor: [
                            'rgb(146, 193, 192)',
                            'rgb(232, 236, 196)',
                            'rgb(236, 147, 106)',
                            'rgb(222, 179, 164)',
                            'rgb(213, 166, 50)',
                            'rgb(197, 196, 188)',
                            'rgb(199, 203, 151)',
                            'rgb(237, 173, 144)',
                            'rgb(185, 189, 167)',
                            'rgb(241, 227, 191)'
                        ],
                        hoverOffset: 4
                    } ]
                },
                options: {
                    plugins: {
                        title: {
                            display: true,
                            text: 'Top 10 SDG Innovation',
                            font: {
                                size: 14,
                                weight: 'bold',
                                family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"
                            },
                        },
                        legend: {
                            display: true,
                            position: 'left',
                            labels: {
                                font: {
                                    size: 10,
                                }
                            }
                        }
                    }
                }
            });
        })
    }
}
