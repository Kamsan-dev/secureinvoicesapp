import { ChangeDetectionStrategy, Component, Input, OnInit, signal } from '@angular/core';
import { DataState } from 'src/app/enums/datastate.enum';
import { Statistics } from 'src/app/interfaces/appstate';
import { getStatusColor, MonthlyInvoiceStatistic } from './statistic';

@Component({
  selector: 'se-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatsComponent implements OnInit {
  public monthlyinvoiceChart: any;
  public ngOnInit(): void {
    const { months, datasets } = this.transformData();

    // Create the chart
    this.monthlyinvoiceChart = {
      data: {
        labels: months, // Months on the X-axis
        datasets: datasets, // Grouped datasets for each status
      },
      options: {
        indexAxis: 'y',
        plugins: {
          legend: {
            position: 'top',
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
      },
    };
  }
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
    console.log(this.monthlystatsSig());
  }

  //#region Statistics

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

  //#endregion

  public onToast(event: any) {
    console.log(event);
  }
}
