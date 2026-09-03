import {Component, ElementRef, EventEmitter, Input, OnChanges, Output, ViewChild} from '@angular/core';
import {ChartConfig} from "../../models/chart-config";
import Chart, {ChartEvent} from "chart.js/auto";

@Component({
  selector: 'app-chart',
  standalone: true,
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.scss'
})
export class ChartComponent implements OnChanges {
  @Input() config!: ChartConfig;
  @Output() readonly sliceClick = new EventEmitter<string>();

  @ViewChild('chartCanvas', { static: true })
  private readonly chartCanvas!: ElementRef<HTMLCanvasElement>;

  private chart?: Chart;

  ngOnChanges(): void {
    if (this.config?.labels.length && this.config?.data.length) {
      this.buildChart();
    }
  }

  private buildChart(): void {
    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: this.config.type,
      data: {
        labels: this.config.labels,
        datasets: [{
          label: 'Medals',
          data: this.config.data,
          backgroundColor: this.config.backgroundColor,
          hoverOffset: this.config.hoverOffset
        }]
      },
      options: {
        aspectRatio: 2.5,
        onClick: (event: ChartEvent) => this.handleClick(event)
      }
    });
  }

  private handleClick(event: ChartEvent): void {
    if (!this.chart || !event.native) {
      return;
    }
    const points = this.chart.getElementsAtEventForMode(event.native, 'point', { intersect: true }, true);
    if (points.length) {
      const label = this.chart.data.labels?.[points[0].index];
      if (typeof label === 'string') {
        this.sliceClick.emit(label);
      }
    }
  }
}
