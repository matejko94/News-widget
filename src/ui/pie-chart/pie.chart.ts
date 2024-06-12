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
          }]
        },
        options: {
          plugins: {
            title: {
              display: true,
              text: 'Top 10 SDG Innovation',
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