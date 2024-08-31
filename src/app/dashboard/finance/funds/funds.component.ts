import { AfterViewInit, Component } from '@angular/core';
import { CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatChip } from '@angular/material/chips';
import { RoundedInputComponent } from '@app/shared/rounded-input/rounded-input.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { budgetPeriods, serverError, statusFilters } from '@app/libs/constants';
import { Fund } from '@app/dashboard/finance/budget-allocation/budget-allocation.interface';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSortModule } from '@angular/material/sort';
import { ZeroPadPipe } from '@app/pipes/zero-pad.pipe';
import { MatIcon } from '@angular/material/icon';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import {
  combineLatest,
  debounceTime,
  finalize,
  first,
  of,
  Subject,
  takeUntil,
  tap,
} from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { FinanceService } from '@app/dashboard/finance/finance.service';
import { AddFundsComponent } from '@app/dashboard/finance/funds/add-funds/add-funds.component';
import { MatDialog } from '@angular/material/dialog';
import {
  ActionModalData,
  ActionModalIllustration,
} from '@app/shared/action-modal/action-modal.type';
import { ActionModalComponent } from '@app/shared/action-modal/action-modal.component';
import { ToastrService } from 'ngx-toastr';
import { getYearsDropDownValues } from '@app/libs/util';

@Component({
  selector: 'app-funds',
  standalone: true,
  imports: [
    DatePipe,
    MatButton,
    MatChip,
    MatTableModule,
    MatRadioModule,
    RoundedInputComponent,
    MatMenuModule,
    ReactiveFormsModule,
    MatProgressSpinner,
    MatSortModule,
    ZeroPadPipe,
    TitleCasePipe,
    MatIconButton,
    MatIcon,
    MatPaginator,
    CurrencyPipe,
  ],
  templateUrl: './funds.component.html',
  styleUrl: './funds.component.scss',
})
export class FundsComponent implements AfterViewInit {
  public periodControl = new FormControl('');
  public yearControl = new FormControl('');
  public statusFilters = statusFilters;
  public data: Fund[] = [];
  public isLoadingResults = true;
  public readonly displayedColumns: string[] = [
    'created_at',
    'period',
    'year',
    'amount',
    'comments',
    'more',
  ];
  public totalItems = 0;
  public page = new FormControl(1);
  private readonly destroy = new Subject<void>();

  constructor(
    private readonly financeService: FinanceService,
    private readonly dialog: MatDialog,
    private readonly toastrService: ToastrService
  ) {}

  ngAfterViewInit(): void {
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
          return this.financeService.getFund(
            page || 1,
            period || '',
            year || ''
          );
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

  addFund(fund?: Fund) {
    const dialogRef = this.dialog.open(AddFundsComponent, {
      maxWidth: '500px',
      maxHeight: '600px',
      width: '100%',
      height: '100%',
      data: fund,
    });
    dialogRef
      .afterClosed()
      .pipe(
        first(),
        tap((fund: Fund) => {
          if (fund) {
            this.page.setValue(1);
          }
        })
      )
      .subscribe();
  }

  deleteStudent(id: string) {
    const data: ActionModalData = {
      actionIllustration: ActionModalIllustration.delete,
      title: 'Delete fund',
      actionColor: 'warn',
      subtext: 'are you sure you want to delete this fund from the system?',
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
        switchMap(() => this.financeService.deleteFund(id)),
        tap(() => {
          dialogRef.componentInstance.isLoading = false;
          dialogRef.close();
          this.page.setValue(1);
          const data: ActionModalData = {
            actionIllustration: ActionModalIllustration.delete,
            title: 'completed',
            actionColor: 'warn',
            subtext:
              'The student has successfully been deleted from the system',
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

  onPaginationChange(event: PageEvent) {
    this.page.setValue(event.pageIndex + 1);
  }

  protected readonly budgetPeriods = [
    { label: 'All', value: '' },
    ...budgetPeriods,
  ];
  protected readonly getYearsDropDownValues = getYearsDropDownValues;
}
