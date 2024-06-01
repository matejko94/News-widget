import {AfterViewInit, Component, input, OnInit} from "@angular/core";
import Chart from 'chart.js/auto';
import {DataService} from "../../utils/data.service";

@Component({
  selector: 'app-piechart',
  standalone: true,
  // standalone: true,
  // styles: [ `
  //   :host {
  //     display: block;
  //     width: 100%;
  //     height: 100%;
  //     aspect-ratio: 16 / 8;
  //   }
  //
  //   ::ng-deep google-map .map-container {
  //     aspect-ratio: 16 / 8;
  //   }
  // ` ],
  template: `
    <div class="pie-chart-container">
      <canvas id="PieChart">{{ chart }}</canvas>
    </div>
  `

})
export class PieChartComponent implements AfterViewInit{
    constructor(private dataService: DataService) { }
    sdg = input.required<string>();

    public chart: any;
    public ngAfterViewInit() {
        this.createChart();
    }

    createChart() {

      console.log(this.sdg())

      this.dataService.getInnovations(this.sdg()).subscribe(response =>  {
        console.log(response)
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
          datasets: [{
            label: 'Top 5 countries by innovation',
            data: dataArray,
            backgroundColor: [
              'rgb(255, 99, 132)',
              'rgb(54, 162, 235)',
              'rgb(255, 205, 86)',
              'rgb(75, 192, 192)',
              'rgb(153, 102, 255)'
            ],
            hoverOffset: 4
          }]
        },
        options: {
          plugins: {
            title: {
              display: true,
              text: 'Top 5 countries by innovation',
              font: {
                size: 24,
                weight: 'bold',
                family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"
              },
              padding: {
                top: 10,
                bottom: 30
              }
            },
            legend: {
              display: true,
              position: 'bottom',
              labels: {
                font: {
                  size: 14,
                  family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"
                }
              }
            }
          }
        }
      });
      })

  }
}