import {
  Component,
  computed,
  OnInit,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButton } from '@angular/material/button';
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
import { ngxCsv } from 'ngx-csv';
import { FinanceService } from '@app/dashboard/finance/finance.service';
import { first, of, tap } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { serverError } from '@app/libs/constants';
import { ToastrService } from 'ngx-toastr';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { SpinnerComponent } from '@app/shared/spinner/spinner.component';

interface Category {
  value: string;
  viewValue: string;
}

interface Term {
  label: string;
  value: string;
}

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
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './financial-report.component.html',
  styleUrl: './financial-report.component.scss',
})
export class FinancialReportComponent implements OnInit {
  isLoading = false;
  selectedTerm!: string;
  selectedValue!: string;
  public startMinDate = new Date();
  data!: [];

  financialReportForm = this.fb.group({
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    term: ['', Validators.required],
    category: ['', Validators.required],
  });
  private reportLabel: WritableSignal<string[]> = signal([]);
  private disbursementDistributionAmounts: WritableSignal<number[]> = signal(
    []
  );
  private budgetDistributionAmounts: WritableSignal<number[]> = signal([]);

  terms: Term[] = [
    { label: 'jan-apr', value: 'Jan - Apr' },
    { label: 'jun-aug', value: 'Jun - Aug' },
    { label: 'sep-dec', value: 'Sep - Dec' },
  ];

  categories: Category[] = [
    { value: 'steak-0', viewValue: 'Steak' },
    { value: 'pizza-1', viewValue: 'Pizza' },
    { value: 'tacos-2', viewValue: 'Tacos' },
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly financeService: FinanceService,
    private readonly toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.getReport();
  }

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
      labels: this.reportLabel(),
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
      ],
    };
  });

  downloadCSV() {
    new ngxCsv(this.data, 'Budgets', {
      // Appropriate headers needs to be provided for CSV
      headers: [],
    });
  }

  getReport() {
    this.isLoading = true;
    this.financeService
      .getReports('')
      .pipe(
        first(),
        tap(({ data }) => {
          const labels: string[] = [];
          const budgetAmounts: number[] = [];
          const disbursementAmounts: number[] = [];
          console.log(data);
          data.forEach(
            ({
              title,
              budgetDistributionAmount,
              disbursementDistributionAmount,
            }) => {
              labels.push(title);
              budgetAmounts.push(budgetDistributionAmount);
              disbursementAmounts.push(disbursementDistributionAmount);
            }
          );
          this.reportLabel.set(labels);
          this.budgetDistributionAmounts.set(budgetAmounts);
          this.disbursementDistributionAmounts.set(disbursementAmounts);
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
