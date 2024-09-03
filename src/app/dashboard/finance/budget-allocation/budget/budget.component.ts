import {
  Component,
  computed,
  ElementRef,
  OnInit,
  signal,
  Signal,
  ViewChild,
  WritableSignal,
} from '@angular/core';
import { AsyncPipe, CurrencyPipe, DatePipe } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import {
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardModule,
} from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { SpinnerComponent } from '@app/shared/spinner/spinner.component';
import { MatIcon } from '@angular/material/icon';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map, switchMap } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FinanceService } from '@app/dashboard/finance/finance.service';
import { debounceTime, finalize, first, startWith, tap } from 'rxjs';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { MatTableModule } from '@angular/material/table';
import {
  BudgetDistribution,
  CreateBudgetDistribution,
  OtherBudgetDistribution,
} from '@app/dashboard/finance/budget-allocation/budget-allocation.interface';
import {
  MatButtonToggle,
  MatButtonToggleGroup,
} from '@angular/material/button-toggle';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BannerComponent } from '@app/shared/banner/banner.component';
import { InfoCardComponent } from '@app/shared/info-card/info-card.component';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatChip } from '@angular/material/chips';
import { MatInput } from '@angular/material/input';
import { MatOption } from '@angular/material/autocomplete';
import { MatSelect } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { CreateBudgetComponent } from '@app/dashboard/finance/create-budget/create-budget.component';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { Papa } from 'ngx-papaparse';
import { convertToNumber } from '@app/libs/numberFormatter';
import { calculateBudgetTotal } from '@app/libs/util';
import { RoundedInputComponent } from '@app/shared/rounded-input/rounded-input.component';

@Component({
  selector: 'app-budget',
  standalone: true,
  imports: [
    AsyncPipe,
    BaseChartDirective,
    MatCard,
    MatCardModule,
    MatCardContent,
    MatFormFieldModule,
    MatGridListModule,
    MatCardContent,
    MatCardHeader,
    SpinnerComponent,
    MatIcon,
    MatTableModule,
    CurrencyPipe,
    MatButtonToggle,
    MatButtonToggleGroup,
    ReactiveFormsModule,
    BannerComponent,
    InfoCardComponent,
    MatButton,
    MatCheckbox,
    MatChip,
    MatIconButton,
    MatInput,
    MatOption,
    MatSelect,
    DatePipe,
    MatMenu,
    MatMenuItem,
    MatSort,
    MatSortHeader,
    MatPaginator,
    MatMenuTrigger,
    RouterLink,
    RoundedInputComponent,
  ],
  templateUrl: './budget.component.html',
  styleUrl: './budget.component.scss',
})
export class BudgetComponent implements OnInit {
  isLoading = false;
  chartLabel: WritableSignal<string[]> = signal([]);
  chartData: WritableSignal<number[]> = signal([]);
  chartDataSefBoarding: WritableSignal<number[]> = signal([]);
  chartLabelSefBoarding: WritableSignal<string[]> = signal([]);

  public chart: Signal<ChartData<'doughnut'>> = computed(() => {
    return {
      labels: this.chartLabel(),
      datasets: [
        {
          data: this.chartData(),
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
  public chartSefBoarding: Signal<ChartData<'doughnut'>> = computed(() => {
    return {
      labels: this.chartLabelSefBoarding(),
      datasets: [
        {
          data: this.chartDataSefBoarding(),
          backgroundColor: [
            'rgba(31, 101, 135, 1)',
            'rgba(197, 231, 255, 1)',
            'rgba(0, 30, 45, 1)',
            'rgba(215, 218, 223, 1)',
            '#FFC000',
            '#6C648B',
            '#41484D',
            '#0091EA',
            '#FFEBB0',
          ],
          hoverOffset: 2,
        },
      ],
    };
  });
  public searchValue = new FormControl('');
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

  public cards = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
    map(({ matches }) => {
      if (matches) {
        return [{ title: 'Budget Split Details', cols: 4, rows: 4, id: 1 }];
      }

      return [
        {
          title: 'Budget Split Details',
          cols: 4,
          rows: 4,
          id: 1,
        },
      ];
    })
  );

  displayedColumns: string[] = [
    'student',
    'school',
    'class',
    'tuition',
    'textBooks',
    'extraClasses',
    'examFee',
    'homeCare',
    'uniformBag',
    'excursion',
    'transportation',
    'stationery',
    'wear',
    'schoolFeeding',
    'provisions',
    'total',
  ];
  otherDisplayedColumns: string[] = ['title', 'comment', 'amount'];
  budgetDistribution: BudgetDistribution[] = [];
  otherBudgetDistribution: OtherBudgetDistribution[] = [];
  budgetTitle = '';
  grandTotal = 0;
  @ViewChild('fileUpload') fileUpload!: ElementRef;

  constructor(
    private readonly breakpointObserver: BreakpointObserver,
    private readonly activatedRoute: ActivatedRoute,
    private readonly financeService: FinanceService,
    private readonly dialog: MatDialog,
    private readonly papa: Papa
  ) {}

  ngOnInit() {
    this.getBudget();
  }

  getTotalCost() {
    return this.budgetDistribution
      .map(distribution => calculateBudgetTotal(distribution))
      .reduce((acc, value) => acc + value, 0);
  }

  getOtherTotalCost() {
    return this.otherBudgetDistribution
      .map(({ amount }) => Number(amount))
      .reduce((acc, value) => acc + value, 0);
  }

  public getBudget() {
    const id = this.activatedRoute.snapshot.params['id'];
    combineLatest([this.searchValue.valueChanges.pipe(startWith(''))])
      .pipe(
        debounceTime(1000),
        switchMap(([search]) => {
          this.isLoading = true;
          return this.financeService.getBudgetDetails(id, search || '');
        }),
        tap(({ data }) => {
          const { period, year, total } = data.budget;
          this.grandTotal = total;
          this.budgetTitle = `${period} ${year}`;
          const { labels, values } = data.splitDetails;
          this.budgetDistribution = data.budgetDistribution;
          this.otherBudgetDistribution = data.otherBudgetDistribution;
          this.chartLabel.set(labels);
          this.chartData.set(values);
          this.isLoading = false;
        }),
        finalize(() => (this.isLoading = false))
      )
      .subscribe();
  }

  addDistribution(budgetDistribution?: CreateBudgetDistribution[]) {
    const dialogRef = this.dialog.open(CreateBudgetComponent, {
      maxWidth: '100%',
      maxHeight: '100%',
      width: '100%',
      height: '100%',
      data: {
        id: this.activatedRoute.snapshot.params['id'],
        budgetDistribution,
      },
    });
    dialogRef
      .afterClosed()
      .pipe(
        first(),
        tap((distribution: BudgetDistribution) => {
          if (distribution) {
            this.searchValue.setValue('');
          }
        })
      )
      .subscribe();
  }

  bulkUpload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    this.papa.parse(file as Blob, {
      complete: ({ data }) => {
        const distribution: CreateBudgetDistribution[] = [];
        for (let i = 1; i < data.length; i++) {
          if (data[i][0] && data[i][1]) {
            distribution.push({
              studentCode: data[i][0],
              school: data[i][1],
              class: data[i][2],
              tuition: convertToNumber(data[i][3]),
              textBooks: convertToNumber(data[i][4]),
              extraClasses: convertToNumber(data[i][5]),
              examFee: convertToNumber(data[i][6]),
              homeCare: convertToNumber(data[i][7]),
              uniformBag: convertToNumber(data[i][8]),
              excursion: convertToNumber(data[i][9]),
              transportation: convertToNumber(data[i][10]),
              stationery: convertToNumber(data[i][11]),
              wears: convertToNumber(data[i][12]),
              schoolFeeding: convertToNumber(data[i][13]),
              provision: convertToNumber(data[i][14]),
            });
          }
        }
        this.fileUpload.nativeElement.value = '';
        this.addDistribution(distribution);
      },
    });
  }

  protected readonly calculateBudgetTotal = calculateBudgetTotal;
}
