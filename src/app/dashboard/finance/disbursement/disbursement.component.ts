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
  of,
  of as observableOf,
  Subject,
  takeUntil,
  tap,
} from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { Disbursement } from '@app/dashboard/finance/disbursement/disbursement.interface';
import { RouterLink } from '@angular/router';
import {
  ActionModalData,
  ActionModalIllustration,
} from '@app/shared/action-modal/action-modal.type';
import { ActionModalComponent } from '@app/shared/action-modal/action-modal.component';
import { serverError } from '@app/libs/constants';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

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
    'name',
    'amount',
    'school',
    'status',
    'more',
  ];
  public searchValue = new FormControl('');
  public categoryControl = new FormControl('');
  public statusControl = new FormControl('');
  public categoryFilters = [
    { value: 'Professional Course', label: 'Professional Course' },
  ];
  public statusFilters = [{ value: 'pending', label: 'Pending' }];
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
    combineLatest([this.page.valueChanges.pipe(startWith(1))])
      .pipe(
        takeUntil(this.destroy),
        debounceTime(1000),
        switchMap(([page]) => {
          this.isLoadingResults = true;
          return this.financeService
            .getDisbursements(page || 1)
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

  changeStatus(status: 'approve' | 'decline', id: string) {
    const approve = status === 'approve';
    const data: ActionModalData = {
      actionIllustration: approve
        ? ActionModalIllustration.activate
        : ActionModalIllustration.deactivate,
      title: approve ? 'Approve Disbursement' : 'Decline Disbursement',
      actionColor: approve ? 'primary' : 'warn',
      subtext: approve
        ? 'are you sure you want to approve this disbursement?'
        : 'are you sure you want decline this disbursement?',
      actionType: 'decision',
      decisionText: approve ? 'Approve' : 'Decline',
    };
    const dialogRef = this.dialog.open(ActionModalComponent, {
      maxWidth: '400px',
      maxHeight: '400px',
      width: '100%',
      height: '100%',
      data,
    });
    const request = approve
      ? this.financeService.approveDisbursement(id)
      : this.financeService.declineDisbursement(id);
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
          dialogRef.componentInstance.isLoading = true;
          dialogRef.disableClose = true;
        }),
        switchMap(() => request),
        tap(response => {
          dialogRef.componentInstance.isLoading = false;
          dialogRef.close();
          const isApproved = response.data.status === 'approved';
          this.page.setValue(1);
          const data: ActionModalData = {
            actionIllustration: isApproved
              ? ActionModalIllustration.success
              : ActionModalIllustration.deactivate,
            title: isApproved ? 'Congratulations!' : 'Completed',
            actionColor: isApproved ? 'primary' : 'warn',
            subtext: isApproved
              ? 'you have successfully approved disbursement'
              : 'The user has been successfully decline disbursement',
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
    new ngxCsv(this.data, 'disbursement', {
      headers: [
        'ID',
        'AMOUNT',
        'NAME',
        'SCHOOL',
        'STATUS',
        'DATE CREATED',
        'DATE UPDATED',
      ],
    });
  }
}
