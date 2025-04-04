import { AfterViewInit, ChangeDetectionStrategy, Component, Input, OnInit, signal, ViewChild } from '@angular/core';
import { Chart, CategoryScale, LinearScale, BarController, BarElement, Legend } from 'chart.js';
import { DialogService } from 'primeng/dynamicdialog';
import { DataState } from 'src/app/enums/datastate.enum';
import { Statistics } from 'src/app/interfaces/appstate';
import { ListInvoiceDialogComponent } from './dialog/list-invoice-dialog.component';
import { getStatusColor, MonthlyInvoiceStatistic } from './statistic';

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
    console.log(stats);
    this.monthlystatsSig.set(stats);
  }

  public monthlyinvoiceChart: any;
  @ViewChild('chartCanvas') chartCanvas: any;

  constructor(private dialogService: DialogService) {
    Chart.register(CategoryScale, LinearScale, BarController, BarElement, Legend);
  }

  public ngAfterViewInit(): void {
    this.initChartOptions();
    this.createChart();
  }

  //#region Monthly Stats Statistics

  private createChart(): void {
    const { months, datasets } = this.transformData();
    this.monthlyinvoiceChart = new Chart(this.chartCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: months,
        datasets: datasets,
      },
      options: this.monthlyinvoiceChart.options,
    });
  }

  private initChartOptions(): void {
    this.monthlyinvoiceChart = {
      options: {
        responsive: true,
        maintainAspectRatio: false, // Allows better scaling in mobile view
        indexAxis: 'y',
        plugins: {
          legend: {
            position: 'top',
            display: true,
            labels: {
              color: 'lightgray', // Custom label color
              font: {
                size: 15, // Adjust font size (optional)
                family: 'Arial', // Font family (optional)
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
        onClick: (event: any, elements: any[]) => {
          if (elements.length > 0) {
            const datasetIndex = elements[0].datasetIndex;
            const dataIndex = elements[0].index;
            this.onMonthlyInvoicesChartClick(datasetIndex, dataIndex);
          }
        },
      },
    };
  }

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
