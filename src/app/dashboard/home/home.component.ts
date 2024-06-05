import {
  Component,
  computed,
  inject,
  OnInit,
  signal,
  Signal,
  ViewChild,
  WritableSignal,
} from '@angular/core';
import { AsyncPipe, DatePipe, TitleCasePipe } from '@angular/common';
import {
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardTitle,
} from '@angular/material/card';
import { MatGridList, MatGridTile } from '@angular/material/grid-list';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { catchError, finalize, first, map } from 'rxjs/operators';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatError, MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatChip } from '@angular/material/chips';
import { MatMenu, MatMenuItem } from '@angular/material/menu';
import { FinanceService } from '@app/dashboard/finance/finance.service';
import { of, tap } from 'rxjs';
import { monthNames, serverError } from '@app/libs/constants';
import { MatInput } from '@angular/material/input';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerToggle,
} from '@angular/material/datepicker';
import { ToastrService } from 'ngx-toastr';
import { SpinnerComponent } from '@app/shared/spinner/spinner.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    AsyncPipe,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    MatGridList,
    MatGridTile,
    MatIcon,
    MatIconButton,
    BaseChartDirective,
    MatSelect,
    MatOption,
    MatError,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    DatePipe,
    MatChip,
    MatMenu,
    MatMenuItem,
    TitleCasePipe,
    MatInput,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatDatepicker,
    SpinnerComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private data: WritableSignal<number[]> = signal([]);
  private doughnutLabel: WritableSignal<string[]> = signal([]);
  private doughnutData: WritableSignal<number[]> = signal([]);
  public isLoading = false;
  public totalFundingDisbursed: Signal<ChartConfiguration['data']> = computed(
    () => {
      return {
        datasets: [
          {
            data: this.data(),
            label: 'Total Funding Disbursed Over Time',
            borderColor: 'rgba(31, 101, 135, 1)',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(148,159,177,0.8)',
            pointStyle: 'line',
          },
        ],
        labels: [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ],
      };
    }
  );
  public lineChartOptions: ChartConfiguration['options'] = {
    elements: {
      line: {
        tension: 0.5,
      },
    },
    plugins: {
      legend: { display: false },
    },
  };
  public lineChartType: ChartType = 'line';

  public doughnutChartData: Signal<ChartData<'doughnut'>> = computed(() => {
    return {
      labels: this.doughnutLabel(),
      datasets: [
        {
          data: this.doughnutData(),
          backgroundColor: [
            'rgba(31, 101, 135, 1)',
            'rgba(197, 231, 255, 1)',
            'rgba(0, 30, 45, 1)',
            'rgba(215, 218, 223, 1)',
          ],
          hoverOffset: 2,
        },
      ],
    };
  });
  public doughnutChartType: ChartType = 'doughnut';
  public tableData = [
    {
      id: 1,
      recipient: 'Foreigner Abu',
      category: 'Stipends',
      amountAllocated: 10000,
      dateAllocated: new Date(),
      dateDisbursed: new Date(),
      status: 'Pending',
    },
    {
      id: 2,
      recipient: 'James Bond',
      category: 'Edu. Materials',
      amountAllocated: 7585,
      dateAllocated: new Date(),
      dateDisbursed: new Date(),
      status: 'Approved',
    },
  ];
  public readonly displayedColumns: string[] = [
    'recipient',
    'category',
    'amountAllocated',
    'dateAllocated',
    'dateDisbursed',
    'status',
  ];
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
  private breakpointObserver = inject(BreakpointObserver);

  /** Based on the screen size, switch from standard to one column per row */
  cards = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
    map(({ matches }) => {
      if (matches) {
        return [
          { title: 'Card 1', cols: 1, rows: 1, id: 1 },
          { title: 'Card 2', cols: 1, rows: 1, id: 2 },
          { title: 'Card 3', cols: 1, rows: 1, id: 3 },
          { title: 'Card 4', cols: 1, rows: 1, id: 4 },
        ];
      }

      return [
        {
          title: 'Funds allocated',
          cols: 1,
          rows: 1,
          id: 1,
        },
        {
          title: 'Funds disbursed',
          cols: 1,
          rows: 1,
          id: 2,
        },
        {
          title: 'Students supported',
          cols: 1,
          rows: 1,
          id: 3,
        },
        {
          title: 'Funding distribution',
          cols: 1,
          rows: 3,
          id: 4,
        },
        {
          title: 'Total Funding Disbursed Over Time',
          cols: 2,
          rows: 3,
          id: 5,
        },
        {
          title: 'Users',
          cols: 3,
          rows: 3,
          id: 6,
        },
      ];
    })
  );

  constructor(
    private readonly financeService: FinanceService,
    private toastrService: ToastrService
  ) {}

  ngOnInit() {
    this.getStatistics();
  }

  private getStatistics() {
    this.isLoading = true;
    this.financeService
      .getStatistics()
      .pipe(
        first(),
        tap(({ data }) => {
          const fundingData = monthNames.map(month => {
            let amount = 0;
            data.totalFundingDisbursed.forEach(item => {
              if (month === item.month) {
                amount = item.total;
              }
            });
            return amount;
          });
          const doughnutLabel = data.fundingDistribution.map(item => {
            return item.title;
          });
          const doughnutData = data.fundingDistribution.map(item => {
            return item.amount;
          });
          this.doughnutLabel.set(doughnutLabel);
          this.doughnutData.set(doughnutData);
          this.data.set(fundingData);
        }),
        catchError(error => {
          this.toastrService.error(
            error.error.message,
            error.error.error || serverError
          );
          return of(null);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe();
  }
}
