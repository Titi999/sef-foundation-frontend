import {
  Component,
  computed,
  inject,
  OnDestroy,
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
import {
  catchError,
  finalize,
  map,
  startWith,
  switchMap,
} from 'rxjs/operators';
import { combineLatest, debounceTime, Subject, takeUntil } from 'rxjs';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatError, MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatChip } from '@angular/material/chips';
import { MatMenu, MatMenuItem } from '@angular/material/menu';
import { FinanceService } from '@app/dashboard/finance/finance.service';
import { of, tap } from 'rxjs';
import { budgetPeriods, serverError } from '@app/libs/constants';
import { MatInput } from '@angular/material/input';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerToggle,
} from '@angular/material/datepicker';
import { ToastrService } from 'ngx-toastr';
import { SpinnerComponent } from '@app/shared/spinner/spinner.component';
import { formatNumber } from '@app/libs/numberFormatter';
import { getYearsDropDownValues } from '@app/libs/util';
import {
  IBeneficiaryOverviewStatistics,
  IOverviewStatistics,
} from '@app/shared/shared.type';
import { UserRoles } from '@app/auth/auth.type';
import { AuthService } from '@app/auth/auth.service';

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
export class HomeComponent implements OnInit, OnDestroy {
  public role!: UserRoles;
  public fundsAllocated = '';
  public fundsDisbursed = '';
  public studentsSupported = '';
  public pendingRequests = '';
  public totalRequests = '';
  private doughnutLabel: WritableSignal<string[]> = signal([]);
  private doughnutData: WritableSignal<number[]> = signal([]);
  public isLoading = false;
  public yearControl = new FormControl('');
  public periodControl = new FormControl('');
  private disbursedLabel: WritableSignal<string[]> = signal([]);
  private disbursedData: WritableSignal<number[]> = signal([]);
  public totalFundingDisbursed: Signal<ChartConfiguration['data']> = computed(
    () => {
      return {
        datasets: [
          {
            data: this.disbursedData(),
            label: 'Total Funding Disbursed Over Time',
            borderColor: 'rgba(31, 101, 135, 1)',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(148,159,177,0.8)',
            pointStyle: 'line',
          },
        ],
        labels: this.disbursedLabel(),
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
            'rgb(11,57,217)',
            'rgba(215, 218, 223, 1)',
            '#FFC000',
            '#6C648B',
            '#41484D',
            '#0091EA',
            '#FFEBB0',
            '#BA1A1A',
            '#51a665',
            '#1f0b33',
          ],
          hoverOffset: 2,
        },
      ],
    };
  });
  public doughnutChartType: ChartType = 'doughnut';
  public doughnutChartOptions: ChartConfiguration['options'] = {
    devicePixelRatio: 2,
    maintainAspectRatio: true,
    responsive: true,
    aspectRatio: 1,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        fullSize: true,
      },
    },
  };
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
  cards = this.breakpointObserver
    .observe([Breakpoints.Tablet, Breakpoints.Handset, Breakpoints.Small])
    .pipe(
      map(({ matches }) => {
        if (matches) {
          return [
            {
              title: 'Funds allocated',
              cols: 4,
              rows: 1,
              id: 1,
            },
            { title: 'Funds disbursed', cols: 4, rows: 1, id: 2 },
            {
              title:
                this.role === 'beneficiary'
                  ? 'Total Requests'
                  : 'Students supported',
              cols: 4,
              rows: 1,
              id: 3,
            },
            {
              title:
                this.role === 'beneficiary'
                  ? 'Pending Requests'
                  : 'Total Funds',
              cols: 4,
              rows: 1,
              id: 4,
            },
            {
              title: 'Funding distribution',
              cols: 4,
              rows: 3,
              id: 5,
            },
            {
              title: 'Total Funding Disbursed Over Time',
              cols: 4,
              rows: 3,
              id: 6,
            },
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
            title:
              this.role === 'beneficiary'
                ? 'Total Requests'
                : 'Students supported',
            cols: 1,
            rows: 1,
            id: 3,
          },
          {
            title:
              this.role === 'beneficiary' ? 'Pending Requests' : 'Total Funds',
            cols: 1,
            rows: 1,
            id: 4,
          },
          {
            title: 'Funding distribution',
            cols: 2,
            rows: 3,
            id: 5,
          },
          {
            title: 'Total Funding Disbursed Over Time',
            cols: 2,
            rows: 3,
            id: 6,
          },
        ];
      })
    );
  public totalFunds = '';
  private readonly destroy = new Subject<void>();

  constructor(
    private readonly financeService: FinanceService,
    private toastrService: ToastrService,
    private readonly authService: AuthService
  ) {}

  ngOnInit() {
    const role = this.authService.role();
    if (role) {
      this.role = role;
    }
    this.getStatistics();
  }

  ngOnDestroy() {
    this.destroy.next();
    this.destroy.complete();
  }

  private getStatistics() {
    combineLatest([
      this.yearControl.valueChanges.pipe(startWith('')),
      this.periodControl.valueChanges.pipe(startWith('')),
    ])
      .pipe(
        takeUntil(this.destroy),
        debounceTime(500),
        switchMap(([year, period]) => {
          this.isLoading = true;
          return this.financeService
            .getStatistics(year || '', period || '')
            .pipe(
              tap(({ data }) => {
                const overviewStatistics = data as IOverviewStatistics;
                const beneficiaryOverviewStatistics =
                  data as IBeneficiaryOverviewStatistics;
                if (beneficiaryOverviewStatistics.totalRequests) {
                  this.totalRequests = formatNumber(
                    beneficiaryOverviewStatistics.totalRequests
                  );
                  this.pendingRequests = formatNumber(
                    beneficiaryOverviewStatistics.pendingRequests
                  );
                }
                this.fundsAllocated =
                  formatNumber(overviewStatistics.fundsAllocated) ?? 0;
                this.studentsSupported =
                  formatNumber(overviewStatistics.studentsSupported) ?? 0;
                this.fundsDisbursed = formatNumber(data.fundsDisbursed) ?? 0;
                this.totalFunds = formatNumber(data.totalFunds) ?? 0;
                const { labels, values } = data.fundingDistribution;
                this.disbursedData.set(
                  data.totalFundingDisbursed?.values || []
                );
                this.disbursedLabel.set(
                  data.totalFundingDisbursed?.labels || []
                );
                this.doughnutLabel.set(labels || []);
                this.doughnutData.set(values || []);
              }),
              catchError(error => {
                this.toastrService.error(
                  error?.error?.message,
                  error?.error?.error || serverError
                );
                return of(null);
              }),
              finalize(() => {
                this.isLoading = false;
              })
            );
        })
      )
      .subscribe();
  }

  protected readonly getYearsDropDownValues = getYearsDropDownValues;
  protected readonly budgetPeriods = [
    { label: 'All', value: '' },
    ...budgetPeriods,
  ];
}
