import { Component, Input, OnInit, AfterViewInit } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { GaugeChart as EChartsGaugeChart } from 'echarts/charts';
import { TooltipComponent, TitleComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  EChartsGaugeChart,
  TooltipComponent,
  TitleComponent,
  CanvasRenderer
]);

@Component({
  selector: 'gauge-chart',
  standalone: true,
  imports: [NgxEchartsDirective],
  templateUrl: './gauge-chart.html',
  styleUrls: ['./gauge-chart.css']
})
export class GaugeChartComponent implements OnInit, AfterViewInit {

  @Input() value: number = 50;
  options: any;

  ngOnInit() {

    this.options = {
      title: {
        text: 'Frequency Hz',
        left: '2%',
        top: '5%',
        textStyle: {
          fontSize: 16,
          fontWeight: '600',
          color: '#333'
        }
      },
      series: [
        {
          type: 'gauge',
          min: 0,
          max: 100,


          axisLine: {

            lineStyle: {
              width: 16,
              color: [
                [0.4, '#4CAF50'], // Green
                [0.7, '#FFC107'], // Yellow
                [1,   '#FF5252']  // Red
              ]
            }
          },

          pointer: {
            width: 4,
            itemStyle: { color: '#555' }
          },

          tick: { show: false },
          splitLine: { show: false },

          detail: {
            formatter: '{value} Hz',
            fontSize: 22,
            fontWeight: 'bold',
            color: '#000',
            offsetCenter: [0, '60%']
          },

          data: [{ value: this.value }]
        }
      ]
    };
  }

  ngAfterViewInit() {
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 300);
  }
}
