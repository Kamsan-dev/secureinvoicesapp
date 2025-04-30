import { AfterViewInit, ChangeDetectionStrategy, Component, Input, OnInit, signal, ViewChild } from '@angular/core';
import { Chart, CategoryScale, LinearScale, BarController, BarElement, Legend, PieController, ArcElement, Tooltip, ChartData, ChartOptions, ChartType } from 'chart.js';
import { DialogService } from 'primeng/dynamicdialog';
import { DataState } from 'src/app/enums/datastate.enum';
import { Statistics } from 'src/app/interfaces/appstate';
import { ListInvoiceDialogComponent } from './dialog/list-invoice-dialog.component';
import { getStatusColor, InvoicesByStatus, MonthlyInvoiceStatistic } from './statistic';
import ChartDataLabels from 'chartjs-plugin-datalabels';

@Component({
  selector: 'se-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatsComponent implements AfterViewInit {
  public readonly statsSig = signal<Statistics | undefined>(undefined);
  @Input() public set stats(stats: Statistics | undefined) {
    this.statsSig.set(stats);
  }

  public readonly dataStateSig = signal<DataState>(DataState.LOADED);
  @Input() public set dataState(dataState: DataState) {
    this.dataStateSig.set(dataState);
  }

  public readonly monthlystatsSig = signal<MonthlyInvoiceStatistic[] | undefined>(undefined);
  @Input() public set monthlyStats(stats: MonthlyInvoiceStatistic[] | undefined) {
    this.monthlystatsSig.set(stats);
  }

  public readonly invoicesStatusStatsSig = signal<InvoicesByStatus | undefined>(undefined);
  @Input() public set invoicesStatusStats(stats: InvoicesByStatus | undefined) {
    this.invoicesStatusStatsSig.set(stats);
  }

  public monthlyinvoiceChart: any;
  public invoicesByStatusChart: any;
  @ViewChild('chartCanvas') chartCanvas: any;
  @ViewChild('chart2Canvas') chart2Canvas: any;

  constructor(private dialogService: DialogService) {
    Chart.register(CategoryScale, LinearScale, BarController, BarElement, Legend, PieController, ArcElement, Tooltip, ChartDataLabels);
  }

  public ngAfterViewInit(): void {
    this.initBreakdownChart();
    this.initInvoiceByStatusChart();
  }

  //#region Monthly Stats Statistics

  private initBreakdownChart(): void {
    const { months, datasets } = this.transformData();
    const options: ChartOptions = {
      responsive: true,
      maintainAspectRatio: false, // Allows better scaling in mobile view
      indexAxis: 'y',
      plugins: {
        legend: {
          position: 'top',
          display: true,
          labels: {
            color: 'lightgray', // Custom label color
            // Custom function to generate circle-shaped labels
            usePointStyle: true,
            pointStyle: 'circle', // Make the label as a circle
            font: {
              size: 18, // Adjust font size (optional)
              family: 'Space Grotesk, sans-serif',
            },
          },
        },
        title: {
          display: true,
          text: '',
          color: 'white',
          font: {
            size: 25,
          },
        },
        datalabels: {
          display: false, // 🔴 Turn off datalabels for this chart
        },
      },
      scales: {
        x: {
          stacked: true,
          ticks: {
            color: 'lightgray', // X-axis label color
            precision: 0,
          },
        }, // Stack the X-axis
        y: {
          stacked: true,
          ticks: {
            color: 'lightgray', // X-axis label color
            precision: 0,
          },
        }, // Stack the Y-axis
      },
      onClick: (event: any, elements: any[], chart: Chart) => {
        if (chart === this.monthlyinvoiceChart && elements.length > 0) {
          const datasetIndex = elements[0].datasetIndex;
          const dataIndex = elements[0].index;
          this.onMonthlyInvoicesChartClick(datasetIndex, dataIndex);
        }
      },
    };

    this.monthlyinvoiceChart = new Chart(this.chartCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: months,
        datasets: datasets,
      },
      options: options,
      plugins: [ChartDataLabels],
    });
  }

  private initInvoiceByStatusChart(): void {
    const { statuses, datasets1 } = this.invoicesByStatus_transformData();
    const data: any = {
      labels: statuses,
      datasets: datasets1,
    };

    const options: ChartOptions<'pie'> = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: 'lightgray', // Custom label color
            // Custom function to generate circle-shaped labels
            usePointStyle: true,
            pointStyle: 'circle', // Make the label as a circle
            font: {
              size: 18, // Adjust font size (optional)
              family: 'Space Grotesk, sans-serif',
            },
          },
        },
        tooltip: {
          enabled: true,
        },
        datalabels: {
          color: 'white',
          formatter: (value: number, context) => {
            const data = context.chart.data.datasets[0].data as number[];
            const total = data.reduce((sum, val) => sum + val, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${percentage}%`;
          },
          font: {
            weight: 'normal',
            size: 14,
            family: 'Space Grotesk, sans-serif',
          },
        },
      },
    };

    this.invoicesByStatusChart = new Chart(this.chart2Canvas.nativeElement, {
      type: 'pie',
      data,
      options,
      plugins: [ChartDataLabels],
    });
  }

  //#region data

  private transformData() {
    // Extract unique months and statuses
    const months = [...new Set(this.monthlystatsSig()?.map((item) => item.month))];
    const statuses = [...new Set(this.monthlystatsSig()?.map((item) => item.status))];

    // Prepare datasets for Chart.js
    const datasets = statuses.map((status) => {
      return {
        label: status,
        data: months.map((month) => {
          const record = this.monthlystatsSig()?.find((item) => item.month === month && item.status === status);
          return record ? record.invoiceCount : 0; // Default to 0 if no data exists
        }),
        backgroundColor: getStatusColor(status), // Assign colors based on status
        stack: 'stacked',
      };
    });
    return { months, datasets };
  }

  private invoicesByStatus_transformData() {
    // Extract unique statuses
    const statuses = this.invoicesStatusStatsSig()?.stats.map((invoice) => invoice.status);
    const count = this.invoicesStatusStatsSig()?.stats.map((invoice) => invoice.count);
    const bgColors = this.invoicesStatusStatsSig()?.stats.map((invoice) => getStatusColor(invoice.status));

    // Prepare datasets for Chart.js
    const datasets1 = [
      {
        label: '',
        data: count,
        backgroundColor: bgColors,
        borderWidth: 0,
      },
    ];
    return { statuses, datasets1 };
  }
  public onMonthlyInvoicesChartClick(datasetIndex: any, dataIndex: any) {
    // Get dataset index and data index
    // const datasetIndex = event.element.datasetIndex;
    // const dataIndex = event.element.index;

    // Retrieve status (dataset label) and date (label from labels array)
    const status = this.monthlyinvoiceChart.data.datasets.at(datasetIndex).label;
    const date = this.monthlyinvoiceChart.data.labels[dataIndex];
    this.dialogService.open(ListInvoiceDialogComponent, {
      header: `${status} invoices of ${date}`,
      width: '35vw',
      modal: true,
      data: {
        status: status,
        date: date,
      },
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw',
      },
    });
  }
}
