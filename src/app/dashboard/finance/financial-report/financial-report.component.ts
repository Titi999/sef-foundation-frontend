import {
  Component,
  computed,
  OnInit,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatOption, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MatError,
  MatFormField,
  MatFormFieldModule,
  MatLabel,
} from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatList, MatListItem } from '@angular/material/list';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSelect } from '@angular/material/select';
import { InfoCardComponent } from '@app/shared/info-card/info-card.component';
import { FinanceService } from '@app/dashboard/finance/finance.service';
import { first, of, switchMap, tap, combineLatest, debounceTime } from 'rxjs';
import { catchError, finalize, startWith } from 'rxjs/operators';
import { budgetPeriods, serverError } from '@app/libs/constants';
import { ToastrService } from 'ngx-toastr';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { SpinnerComponent } from '@app/shared/spinner/spinner.component';
import { DatePipe, TitleCasePipe } from '@angular/common';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
} from '@angular/material/table';
import { MatChip } from '@angular/material/chips';
import { MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatSort } from '@angular/material/sort';
import { ZeroPadPipe } from '@app/pipes/zero-pad.pipe';
import { AccountingRow } from '@app/dashboard/finance/financial-report/finance-report.interface';
import {
  MatButtonToggle,
  MatButtonToggleGroup,
} from '@angular/material/button-toggle';
import { getYearsDropDownValues } from '@app/libs/util';

@Component({
  selector: 'app-financial-report',
  standalone: true,
  imports: [
    InfoCardComponent,
    FormsModule,
    MatError,
    MatFormField,
    MatLabel,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIcon,
    MatProgressSpinner,
    MatSelect,
    MatOption,
    MatList,
    MatListItem,
    MatDatepickerModule,
    MatButton,
    BaseChartDirective,
    SpinnerComponent,
    DatePipe,
    MatCell,
    MatCellDef,
    MatChip,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatIconButton,
    MatMenu,
    MatMenuItem,
    MatRow,
    MatRowDef,
    MatSort,
    MatTable,
    TitleCasePipe,
    ZeroPadPipe,
    MatHeaderCellDef,
    MatButtonToggle,
    MatButtonToggleGroup,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './financial-report.component.html',
  styleUrl: './financial-report.component.scss',
})
export class FinancialReportComponent implements OnInit {
  isLoading = false;
  data!: [];
  private disbursementDistributionAmounts: WritableSignal<number[]> = signal(
    []
  );
  public yearControl = new FormControl('');
  public periodControl = new FormControl('');
  private budgetDistributionAmounts: WritableSignal<number[]> = signal([]);
  private fundDistributionAmounts: WritableSignal<number[]> = signal([]);
  public displayStyleControl = new FormControl('table');
  protected readonly budgetPeriods = [
    { label: 'All', value: '' },
    ...budgetPeriods,
  ];

  public chartOptions: ChartConfiguration['options'] = {
    aspectRatio: 2.5,
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
    },
  };
  public chartType: ChartType = 'bar';

  public chart: Signal<ChartData<'bar'>> = computed(() => {
    return {
      labels: ['September - December', 'January - April', 'May - August'],
      datasets: [
        {
          label: 'Budget',
          data: this.budgetDistributionAmounts(),
          backgroundColor: '#1F6587',
          borderRadius: 5,
        },
        {
          label: 'Disbursement',
          data: this.disbursementDistributionAmounts(),
          backgroundColor: '#C5E7FF',
          borderRadius: 5,
        },
        {
          label: 'Fund',
          data: this.fundDistributionAmounts(),
          backgroundColor: '#FFC000',
          borderRadius: 5,
        },
      ],
    };
  });
  public accountingRows: AccountingRow[] = [];
  public readonly displayedColumns: string[] = [
    'description',
    'period',
    'year',
    'amount',
    'runningTotal',
  ];
  constructor(
    private readonly financeService: FinanceService,
    private readonly toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.getReport();
  }

  getReport() {
    combineLatest([
      this.yearControl.valueChanges.pipe(startWith('')),
      this.periodControl.valueChanges.pipe(startWith('')),
    ])
      .pipe(
        debounceTime(500),
        tap(() => (this.isLoading = true)),
        switchMap(([year, period]) =>
          this.financeService.getReports(period || '', year || '').pipe(
            first(),
            tap(({ data }) => {
              const { accounting, summaryChart } = data;
              this.accountingRows = accounting;
              this.budgetDistributionAmounts.set(summaryChart.budget.values);
              this.disbursementDistributionAmounts.set(
                summaryChart.disbursements.values
              );
              this.fundDistributionAmounts.set(summaryChart.fund.values);
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
        )
      )
      .subscribe();
  }
  protected readonly getYearsDropDownValues = getYearsDropDownValues;
}
