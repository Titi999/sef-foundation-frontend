import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AsyncPipe } from '@angular/common';
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
  termList,
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
import { combineLatest, startWith } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
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
import { PerformanceService } from '@app/dashboard/performance/performance.service';
import { AcademicPerformance } from '@app/dashboard/performance/performance.interface';

@Component({
  selector: 'app-academic',
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
  ],
  templateUrl: './academic.component.html',
  styleUrl: './academic.component.scss',
})
export class AcademicComponent implements OnInit {
  protected classList = classesList;
  protected typeList = termList;
  private breakpointObserver = inject(BreakpointObserver);
  private performanceService = inject(PerformanceService);
  private toastrService = inject(ToastrService);
  public searchControl = new FormControl('');
  public termControl = new FormControl('');
  public isLoadingResults = false;
  public yearControl = new FormControl('');
  public data: AcademicPerformance[] = [];
  public readonly displayedColumns: string[] = [
    'student',
    'grade',
    'school',
    'averageScore',
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
  private studentPerformanceRanks: WritableSignal<AcademicPerformance[]> =
    signal([]);

  private readonly matchesBreakpoint = toSignal(
    this.breakpointObserver
      .observe(Breakpoints.Handset)
      .pipe(map(({ matches }) => matches))
  );

  cards = computed(() => {
    const ranks = this.studentPerformanceRanks();
    if (this.matchesBreakpoint()) {
      return [
        {
          title: ranks[0]?.studentName,
          cols: 1,
          rows: 1,
          id: 1,
          level: ranks[0]?.grade,
          averageScore: ranks[0]?.averageScore,
        },
        {
          title: ranks[1]?.studentName,
          cols: 1,
          rows: 1,
          id: 2,
          level: ranks[1]?.grade,
          averageScore: ranks[1]?.averageScore,
        },
        {
          title: ranks[2]?.studentName,
          cols: 1,
          rows: 1,
          id: 3,
          level: ranks[2]?.grade,
          averageScore: ranks[2]?.averageScore,
        },
      ];
    }

    return [
      {
        title: ranks[0]?.studentName,
        level: ranks[0]?.grade,
        averageScore: ranks[0]?.averageScore,
        cols: 1,
        rows: 1,
        id: 1,
      },
      {
        title: ranks[1]?.studentName,
        level: ranks[1]?.grade,
        averageScore: ranks[1]?.averageScore,
        cols: 1,
        rows: 1,
        id: 2,
      },
      {
        title: ranks[2]?.studentName,
        level: ranks[2]?.grade,
        averageScore: ranks[2]?.averageScore,
        cols: 1,
        rows: 1,
        id: 3,
      },
    ];
  });

  ngOnInit() {
    this.getAcademicsPerformance();
  }

  onPaginationChange(event: PageEvent) {
    this.page.setValue(event.pageIndex + 1);
  }

  getAcademicsPerformance() {
    this.isLoadingResults = true;
    combineLatest([
      this.searchControl.valueChanges.pipe(
        startWith(''),
        filter((searchValue): searchValue is string => searchValue !== null)
      ),
      this.page.valueChanges.pipe(startWith(1)),
      this.termControl.valueChanges.pipe(startWith('')),
      this.yearControl.valueChanges.pipe(startWith('')),
    ])
      .pipe(
        takeUntil(this.destroy),
        debounceTime(1000),
        switchMap(([search, page, term, year]) => {
          this.isLoadingResults = true;
          return this.performanceService
            .getAcademicPerformance(search, page || 1, term || '', year || '')
            .pipe(
              tap(({ data }) => {
                const { academicPerformance, performanceRank } = data;
                this.studentPerformanceRanks.set(performanceRank);
                this.performanceLabel.set(
                  performanceRank.map(({ studentName }) => studentName)
                );
                this.performanceData.set(
                  performanceRank
                    .map(({ averageScore }) => Number(averageScore))
                    .slice(0, 10)
                );
                this.data = academicPerformance.items;
                this.totalItems = academicPerformance.total;
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
    new ngxCsv(this.data, 'SEF Academic Performance', {
      headers: [
        'STUDENT ID ',
        'STUDENT NAME',
        'CLASS / LEVEL',
        'SCHOOL',
        'TOTAL SCORE',
        'TOTAL COURSES',
        'TOTAL ACTUAL SCORE',
        'AVERAGE SCORE',
      ],
    });
  }

  protected readonly formatNumber = formatNumber;
  protected readonly getYearsDropDownValues = getYearsDropDownValues;
  protected readonly Number = Number;
  protected readonly termList = termList;
}
