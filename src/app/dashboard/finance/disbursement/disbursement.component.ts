import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { RoundedInputComponent } from '@app/shared/rounded-input/rounded-input.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { ngxCsv } from 'ngx-csv';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSort } from '@angular/material/sort';
import { MatChip } from '@angular/material/chips';
import { MatIcon } from '@angular/material/icon';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { FinanceService } from '@app/dashboard/finance/finance.service';
import {
  combineLatest,
  debounceTime,
  finalize,
  first,
  of,
  of as observableOf,
  Subject,
  takeUntil,
  tap,
} from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { Disbursement } from '@app/dashboard/finance/disbursement/disbursement.interface';
import { RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { User } from '@app/auth/auth.type';
import { CreateDisbursementComponent } from '@app/dashboard/finance/create-disbursement/create-disbursement.component';
import {
  budgetPeriods,
  requestFilters,
  serverError,
} from '@app/libs/constants';
import {
  ActionModalData,
  ActionModalIllustration,
} from '@app/shared/action-modal/action-modal.type';
import { ActionModalComponent } from '@app/shared/action-modal/action-modal.component';
import { getYearsDropDownValues } from '@app/libs/util';

@Component({
  selector: 'app-disbursement',
  standalone: true,
  imports: [
    DatePipe,
    MatButton,
    RoundedInputComponent,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
    ReactiveFormsModule,
    MatRadioGroup,
    MatRadioButton,
    MatProgressSpinner,
    MatTableModule,
    MatChip,
    MatSort,
    TitleCasePipe,
    MatIcon,
    MatIconButton,
    MatPaginator,
    RouterLink,
    CurrencyPipe,
  ],
  templateUrl: './disbursement.component.html',
  styleUrl: './disbursement.component.scss',
})
export class DisbursementComponent implements AfterViewInit, OnDestroy {
  public readonly displayedColumns: string[] = [
    'created_at',
    'title',
    'amount',
    'period',
    'year',
    'more',
  ];
  public searchValue = new FormControl('');
  public yearControl = new FormControl('');
  public periodControl = new FormControl('');
  public statusFilters = requestFilters;
  public data: Disbursement[] = [];
  public isLoadingResults = false;
  public totalItems = 0;
  public page = new FormControl(1);
  private readonly destroy = new Subject<void>();

  constructor(
    private readonly financeService: FinanceService,
    private readonly dialog: MatDialog,
    private readonly toastrService: ToastrService
  ) {}

  ngAfterViewInit() {
    combineLatest([
      this.page.valueChanges.pipe(startWith(1)),
      this.periodControl.valueChanges.pipe(startWith('')),
      this.searchValue.valueChanges.pipe(startWith('')),
      this.yearControl.valueChanges.pipe(startWith('')),
    ])
      .pipe(
        takeUntil(this.destroy),
        debounceTime(1000),
        switchMap(([page, period, search, year]) => {
          this.isLoadingResults = true;
          return this.financeService
            .getDisbursements(page || 1, period || '', search || '', year || '')
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

  addDisbursement(disbursement?: Disbursement) {
    const dialogRef = this.dialog.open(CreateDisbursementComponent, {
      maxWidth: '100%',
      maxHeight: '100%',
      width: '100%',
      height: '100%',
      data: disbursement,
    });
    dialogRef
      .afterClosed()
      .pipe(
        first(),
        tap((user: User) => {
          if (user) {
            this.page.setValue(1);
          }
        })
      )
      .subscribe();
  }

  deleteDisbursement(id: string) {
    const data: ActionModalData = {
      actionIllustration: ActionModalIllustration.delete,
      title: 'Delete disbursement',
      actionColor: 'warn',
      subtext:
        'are you sure you want to delete this disbursement from the system?',
      actionType: 'decision',
      decisionText: 'Delete',
    };
    const dialogRef = this.dialog.open(ActionModalComponent, {
      maxWidth: '400px',
      maxHeight: '400px',
      width: '100%',
      height: '100%',
      data,
    });
    dialogRef.componentInstance.decisionEmitter
      .pipe(
        takeUntil(this.destroy),
        catchError(error => {
          this.toastrService.error(
            error.error.message,
            error.error.error || serverError
          );
          return of(null);
        }),
        finalize(() => {
          dialogRef.componentInstance.isLoading = false;
          dialogRef.disableClose = false;
        }),
        tap(() => {
          dialogRef.disableClose = true;
          dialogRef.componentInstance.isLoading = true;
        }),
        switchMap(() =>
          this.financeService.deleteDisbursementByBeneficiary(id)
        ),
        tap(() => {
          dialogRef.componentInstance.isLoading = false;
          dialogRef.close();
          this.page.setValue(1);
          const data: ActionModalData = {
            actionIllustration: ActionModalIllustration.delete,
            title: 'completed',
            actionColor: 'warn',
            subtext:
              'The disbursement has successfully been deleted from the system',
            actionType: 'close',
          };
          this.dialog.open(ActionModalComponent, {
            maxWidth: '400px',
            maxHeight: '400px',
            width: '100%',
            height: '100%',
            data,
          });
        })
      )
      .subscribe();
  }

  downloadCSV() {
    const data = this.data.map(disbursement => {
      return {
        id: disbursement.id,
        amount: disbursement.amount,
        name: disbursement.__student__.name,
        school: disbursement.__student__.school.name,
        dateCreated: disbursement.created_at,
      };
    });
    new ngxCsv(data, 'disbursement', {
      headers: ['ID', 'AMOUNT', 'NAME', 'SCHOOL', 'STATUS', 'DATE CREATED'],
    });
  }

  protected readonly budgetPeriods = [
    { label: 'All', value: '' },
    ...budgetPeriods,
  ];
  protected readonly getYearsDropDownValues = getYearsDropDownValues;
}
