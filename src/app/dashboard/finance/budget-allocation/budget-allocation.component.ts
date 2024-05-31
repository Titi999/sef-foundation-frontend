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
import { User, UserRoles } from '@app/auth/auth.type';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  combineLatest,
  debounceTime,
  filter,
  finalize,
  first,
  of,
  of as observableOf,
  Subject,
  takeUntil,
  tap,
} from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { AddUserComponent } from '@app/dashboard/user-administration/add-user/add-user.component';
import { AddUser } from '@app/dashboard/user-administration/add-user/add-user.type';
import {
  ActionModalData,
  ActionModalIllustration,
} from '@app/shared/action-modal/action-modal.type';
import { ActionModalComponent } from '@app/shared/action-modal/action-modal.component';
import { serverError, statusFilters } from '@app/libs/constants';
import { ngxCsv } from 'ngx-csv';
import { BudgetAllocation } from '@app/dashboard/finance/budget-allocation/budget-allocation.interface';
import { UserAdministrationService } from '@app/dashboard/user-administration/user-administration.service';
import { RouterLink } from '@angular/router';
import { FinanceService } from '@app/dashboard/finance/finance.service';
import { getShortMonthAndYear, getShortMonthName } from '@app/libs/date';

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
    'termDate',
    'total',
    'utilized',
    'surplus',
    'more',
  ];
  public data: BudgetAllocation[] = [];
  public totalItems = 0;
  public isLoadingResults = true;
  public searchValue = new FormControl('');
  private readonly destroy = new Subject<void>();
  public page = new FormControl(1);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private readonly financeService: FinanceService,
    private readonly dialog: MatDialog,
    private toastrService: ToastrService,
    private userAdministrationService: UserAdministrationService
  ) {}

  ngAfterViewInit() {
    combineLatest([
      this.searchValue.valueChanges.pipe(
        startWith(''),
        filter((searchValue): searchValue is string => searchValue !== null)
      ),
      this.page.valueChanges.pipe(startWith(1)),
      this.paginator.page.pipe(startWith(new PageEvent())),
    ])
      .pipe(
        takeUntil(this.destroy),
        debounceTime(1000),
        switchMap(([search, page]) => {
          console.log(search);
          this.isLoadingResults = true;
          return this.financeService
            .getBudgets(page || 1)
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

  downloadCSV() {
    new ngxCsv(this.data, 'Budgets', {
      headers: [
        'ID',
        'TOTAL BUDGET AMOUNT',
        'TOTAL AMOUNT UTILIZED',
        'SURPLUS / DEFICIT',
        'START DATE',
        'END DATE',
        'REMEMBER TOKEN',
        'DATE EMAIL VERIFIED',
        'DATE CREATED',
        'DATE UPDATED',
      ],
    });
  }

  protected readonly getShortMonthName = getShortMonthName;
  protected readonly getShortMonthAndYear = getShortMonthAndYear;
}
