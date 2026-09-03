import {
  Component,
  ElementRef,
  effect,
  EffectCleanupRegisterFn,
  input,
  output,
  viewChild,
} from '@angular/core';
import { ChartConfig } from '../../models/chart-config';
import Chart, { ChartEvent } from 'chart.js/auto';

@Component({
  selector: 'app-chart',
  standalone: true,
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.scss',
})
export class ChartComponent {
  readonly config = input.required<ChartConfig>();
  readonly sliceClick = output<string>();

  private readonly chartCanvas = viewChild<ElementRef<HTMLCanvasElement>>('chartCanvas');

  private chart?: Chart;

  constructor() {
    // Reconstruit le graphique dès que la configuration (ou le canvas) change.
    effect((onCleanup: EffectCleanupRegisterFn) => {
      const canvas = this.chartCanvas();
      const config = this.config();

      if (!canvas || !config.labels.length || !config.data.length) {
        return;
      }

      this.chart = this.buildChart(canvas.nativeElement, config);
      onCleanup(() => this.chart?.destroy());
    });
  }

  private buildChart(canvas: HTMLCanvasElement, config: ChartConfig): Chart {
    return new Chart(canvas, {
      type: config.type,
      data: {
        labels: config.labels,
        datasets: [
          {
            label: 'Medals',
            data: config.data,
            backgroundColor: config.backgroundColor,
            hoverOffset: config.hoverOffset,
          },
        ],
      },
      options: {
        aspectRatio: 2.5,
        onClick: (event: ChartEvent) => this.handleClick(event),
      },
    });
  }

  private handleClick(event: ChartEvent): void {
    if (!this.chart || !event.native) {
      return;
    }
    const points = this.chart.getElementsAtEventForMode(
      event.native,
      'point',
      { intersect: true },
      true,
    );
    if (points.length) {
      const label = this.chart.data.labels?.[points[0].index];
      if (typeof label === 'string') {
        this.sliceClick.emit(label);
      }
    }
  }
}
