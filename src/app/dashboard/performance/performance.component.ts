import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AsyncPipe, CurrencyPipe } from '@angular/common';
import {
  Component,
  ViewChild,
  inject,
  OnInit,
  computed,
  Signal,
  WritableSignal,
  signal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import {
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardModule,
  MatCardTitle,
} from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatOption } from '@angular/material/core';
import { MatError, MatFormFieldModule } from '@angular/material/form-field';
import { MatGridList, MatGridTile } from '@angular/material/grid-list';
import { MatIcon } from '@angular/material/icon';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { MatSelect } from '@angular/material/select';
import { MatSort } from '@angular/material/sort';
import {
  MatTable,
  MatHeaderCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatCellDef,
  MatCell,
} from '@angular/material/table';
import {
  classesList,
  serverError,
  statusFilters,
  typesList,
} from '@app/libs/constants';
import { RoundedInputComponent } from '@app/shared/rounded-input/rounded-input.component';
import { ngxCsv } from 'ngx-csv';
import {
  Subject,
  map,
  tap,
  finalize,
  filter,
  takeUntil,
  debounceTime,
  switchMap,
  of,
} from 'rxjs';
import { AvatarModule } from 'ngx-avatars';
import { FinanceService } from '@app/dashboard/finance/finance.service';
import { combineLatest, startWith } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { IStudentPerformanceRanks } from '@app/shared/shared.type';
import { SpinnerComponent } from '@app/shared/spinner/spinner.component';
import { formatNumber } from '@app/libs/numberFormatter';
import {
  MatButtonToggle,
  MatButtonToggleGroup,
} from '@angular/material/button-toggle';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { getYearsDropDownValues } from '@app/libs/util';

@Component({
  selector: 'app-performance',
  standalone: true,
  imports: [
    MatSelect,
    MatOption,
    MatError,
    ReactiveFormsModule,
    MatFormFieldModule,
    AsyncPipe,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    MatGridList,
    MatGridTile,
    MatIcon,
    MatIconButton,
    MatCardModule,
    MatChipsModule,
    MatTable,
    MatSort,
    MatHeaderCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatPaginator,
    MatCell,
    MatCellDef,
    RoundedInputComponent,
    MatButtonModule,
    MatMenuTrigger,
    MatIconButton,
    MatIcon,
    MatMenu,
    MatMenuItem,
    MatRadioButton,
    MatRadioGroup,
    AvatarModule,
    SpinnerComponent,
    MatButtonToggleGroup,
    MatButtonToggle,
    BaseChartDirective,
    CurrencyPipe,
  ],
  templateUrl: './performance.component.html',
  styleUrl: './performance.component.scss',
})
export class PerformanceComponent implements OnInit {
  protected classList = classesList;
  protected typeList = typesList;
  private breakpointObserver = inject(BreakpointObserver);
  private financeService = inject(FinanceService);
  private toastrService = inject(ToastrService);
  public searchControl = new FormControl('');
  public typeControl = new FormControl('');
  public isLoadingResults = false;
  public yearControl = new FormControl('');
  public data: IStudentPerformanceRanks[] = [];
  public readonly displayedColumns: string[] = [
    'recipient',
    'grade',
    'school',
    'amount',
  ];
  public totalItems = 0;
  public page = new FormControl(1);
  private readonly destroy = new Subject<void>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  public statusControl = new FormControl('');
  public categoryControl = new FormControl([]);
  public statusFilters = statusFilters;
  public displayStyleControl = new FormControl<'chart' | 'table'>('chart');
  public performanceLabel: WritableSignal<string[]> = signal([]);
  public performanceData: WritableSignal<number[]> = signal([]);
  public chartType: ChartType = 'bar';
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
  public chart: Signal<ChartData<'bar'>> = computed(() => {
    return {
      labels: this.performanceLabel(),
      datasets: [
        {
          label: 'Total Disbursements',
          data: this.performanceData(),
          backgroundColor: '#1F6587',
          borderRadius: 5,
          indexAxis: 'y',
        },
      ],
    };
  });
  private studentPerformanceRanks: WritableSignal<IStudentPerformanceRanks[]> =
    signal([]);

  private readonly matchesBreakpoint = toSignal(
    this.breakpointObserver
      .observe(Breakpoints.Tablet)
      .pipe(map(({ matches }) => matches))
  );

  cards = computed(() => {
    const ranks = this.studentPerformanceRanks();
    if (this.matchesBreakpoint()) {
      return [
        {
          title: ranks[0]?.student,
          cols: 3,
          rows: 3,
          id: 1,
          level: ranks[0]?.level,
          totalDisbursement: ranks[0]?.totalDisbursement,
        },
        {
          title: ranks[1]?.student,
          cols: 3,
          rows: 3,
          id: 2,
          level: ranks[1]?.level,
          totalDisbursement: ranks[1]?.totalDisbursement,
        },
        {
          title: ranks[2]?.student,
          cols: 3,
          rows: 3,
          id: 3,
          level: ranks[2]?.level,
          totalDisbursement: ranks[2]?.totalDisbursement,
        },
      ];
    }

    return [
      {
        title: ranks[0]?.student,
        level: ranks[0]?.level,
        totalDisbursement: ranks[0]?.totalDisbursement,
        cols: 1,
        rows: 1,
        id: 1,
      },
      {
        title: ranks[1]?.student,
        level: ranks[1]?.level,
        totalDisbursement: ranks[1]?.totalDisbursement,
        cols: 1,
        rows: 1,
        id: 2,
      },
      {
        title: ranks[2]?.student,
        level: ranks[2]?.level,
        totalDisbursement: ranks[2]?.totalDisbursement,
        cols: 1,
        rows: 1,
        id: 3,
      },
    ];
  });

  ngOnInit() {
    this.getDisbursementPerformance();
  }

  onPaginationChange(event: PageEvent) {
    this.page.setValue(event.pageIndex + 1);
  }

  getDisbursementPerformance() {
    this.isLoadingResults = true;
    combineLatest([
      this.searchControl.valueChanges.pipe(
        startWith(''),
        filter((searchValue): searchValue is string => searchValue !== null)
      ),
      this.page.valueChanges.pipe(startWith(1)),
      this.typeControl.valueChanges.pipe(startWith('')),
      this.yearControl.valueChanges.pipe(startWith('')),
      this.categoryControl.valueChanges.pipe(startWith([])),
    ])
      .pipe(
        takeUntil(this.destroy),
        debounceTime(1000),
        switchMap(([search, page, type, year, category]) => {
          this.isLoadingResults = true;
          return this.financeService
            .getPerformance(
              search,
              page || 1,
              type || '',
              year || '',
              category || []
            )
            .pipe(
              tap(({ data }) => {
                const { studentTotalDisbursements, studentPerformanceRank } =
                  data;
                this.studentPerformanceRanks.set(data.studentPerformanceRank);
                this.performanceLabel.set(
                  studentPerformanceRank.map(({ student }) => student)
                );
                this.performanceData.set(
                  studentPerformanceRank
                    .map(({ totalDisbursement }) => totalDisbursement)
                    .slice(0, 10)
                );
                this.data = studentTotalDisbursements.items;
                this.totalItems = studentTotalDisbursements.total;
              }),
              finalize(() => (this.isLoadingResults = false)),
              catchError(error => {
                this.toastrService.error(
                  error.error.message,
                  error.error.error || serverError
                );
                return of(null);
              })
            );
        })
      )
      .subscribe();
  }

  downloadCSV() {
    new ngxCsv(this.data, 'SEF Performance', {
      headers: ['RECIPIENT', 'AMOUNT', 'CLASS / LEVEL', 'SCHOOL'],
    });
  }

  protected readonly formatNumber = formatNumber;
  protected readonly getYearsDropDownValues = getYearsDropDownValues;
}
