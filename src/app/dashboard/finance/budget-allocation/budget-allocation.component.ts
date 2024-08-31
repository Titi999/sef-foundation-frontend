import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import {
  AsyncPipe,
  CurrencyPipe,
  DatePipe,
  TitleCasePipe,
} from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { MatCardModule } from '@angular/material/card';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { MatGridList, MatGridTile } from '@angular/material/grid-list';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
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
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { RoundedInputComponent } from '@app/shared/rounded-input/rounded-input.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  combineLatest,
  debounceTime,
  first,
  of as observableOf,
  Subject,
  takeUntil,
  tap,
} from 'rxjs';
import { ngxCsv } from 'ngx-csv';
import { BudgetAllocation } from '@app/dashboard/finance/budget-allocation/budget-allocation.interface';
import { RouterLink } from '@angular/router';
import { FinanceService } from '@app/dashboard/finance/finance.service';
import { budgetPeriods, statusFilters } from '@app/libs/constants';
import { AddBudgetComponent } from '@app/dashboard/finance/budget-allocation/add-budget/add-budget.component';
import { MatDialog } from '@angular/material/dialog';
import { getYearsDropDownValues } from '@app/libs/util';

@Component({
  selector: 'app-budget-allocation',
  standalone: true,
  imports: [
    AsyncPipe,
    BaseChartDirective,
    DatePipe,
    MatGridList,
    MatGridTile,
    MatIcon,
    MatIconButton,
    MatCardModule,
    MatButton,
    MatCell,
    MatCellDef,
    MatChip,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatMenu,
    MatMenuItem,
    MatPaginator,
    MatProgressSpinner,
    MatRadioButton,
    MatRadioGroup,
    MatRow,
    MatRowDef,
    MatSort,
    MatSortHeader,
    MatTable,
    RoundedInputComponent,
    TitleCasePipe,
    MatMenuTrigger,
    ReactiveFormsModule,
    MatHeaderCellDef,
    RouterLink,
    CurrencyPipe,
  ],
  templateUrl: './budget-allocation.component.html',
  styleUrl: './budget-allocation.component.scss',
})
export class BudgetAllocationComponent implements AfterViewInit, OnDestroy {
  public readonly displayedColumns: string[] = [
    'created_at',
    'period',
    'total',
    'more',
  ];
  public data: BudgetAllocation[] = [];
  public totalItems = 0;
  public isLoadingResults = true;
  public searchValue = new FormControl('');
  private readonly destroy = new Subject<void>();
  public page = new FormControl(1);
  public periodControl = new FormControl('');
  public yearControl = new FormControl('');

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private readonly financeService: FinanceService,
    private readonly dialog: MatDialog
  ) {}

  ngAfterViewInit() {
    combineLatest([
      this.page.valueChanges.pipe(startWith(1)),
      this.periodControl.valueChanges.pipe(startWith('')),
      this.yearControl.valueChanges.pipe(startWith('')),
    ])
      .pipe(
        takeUntil(this.destroy),
        debounceTime(1000),
        switchMap(([page, period, year]) => {
          this.isLoadingResults = true;
          return this.financeService
            .getBudgets(page || 1, period || '', year || '')
            .pipe(catchError(() => observableOf(null)));
        }),
        map(data => {
          this.isLoadingResults = false;

          if (data === null) {
            return [];
          }
          this.totalItems = data.data.total;
          return data.data.items;
        })
      )
      .subscribe(data => (this.data = data));
  }

  ngOnDestroy() {
    this.destroy.next();
    this.destroy.complete();
  }

  onPaginationChange(event: PageEvent): void {
    this.page.setValue(event.pageIndex + 1);
  }

  addBudget() {
    const dialogRef = this.dialog.open(AddBudgetComponent, {
      maxWidth: '500px',
      maxHeight: '300px',
      width: '100%',
      height: '100%',
    });
    dialogRef
      .afterClosed()
      .pipe(
        first(),
        tap((budget: BudgetAllocation) => {
          if (budget) {
            this.page.setValue(1);
          }
        })
      )
      .subscribe();
  }

  editBudget(budget: BudgetAllocation) {
    const dialogRef = this.dialog.open(AddBudgetComponent, {
      maxWidth: '500px',
      maxHeight: '300px',
      width: '100%',
      height: '100%',
      data: budget,
    });
    dialogRef
      .afterClosed()
      .pipe(
        first(),
        tap((budget: BudgetAllocation) => {
          if (budget) {
            this.page.setValue(1);
          }
        })
      )
      .subscribe();
  }

  downloadCSV() {
    new ngxCsv(this.data, 'Budgets', {
      headers: [
        'ID',
        'TOTAL',
        'YEAR',
        'PERIOD',
        'STATUS',
        'DATE CREATED',
        'DATE UPDATED',
      ],
    });
  }

  protected readonly statusFilters = statusFilters;
  protected readonly budgetPeriods = budgetPeriods;
  protected readonly getYearsDropDownValues = getYearsDropDownValues;
}
