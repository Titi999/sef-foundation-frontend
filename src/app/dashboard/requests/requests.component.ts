import { AfterViewInit, Component } from '@angular/core';
import { CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { RoundedInputComponent } from '@app/shared/rounded-input/rounded-input.component';
import { MatMenuModule } from '@angular/material/menu';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
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
import { SpinnerComponent } from '@app/shared/spinner/spinner.component';
import { Disbursement } from '@app/dashboard/finance/disbursement/disbursement.interface';
import { MatTableModule } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatChip } from '@angular/material/chips';
import { MatIcon } from '@angular/material/icon';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { RouterLink } from '@angular/router';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { FinanceService } from '@app/dashboard/finance/finance.service';
import { requestFilters, serverError } from '@app/libs/constants';
import {
  ActionModalData,
  ActionModalIllustration,
} from '@app/shared/action-modal/action-modal.type';
import { ActionModalComponent } from '@app/shared/action-modal/action-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-requests',
  standalone: true,
  imports: [
    CurrencyPipe,
    RoundedInputComponent,
    MatMenuModule,
    MatButtonModule,
    MatRadioGroup,
    MatRadioButton,
    ReactiveFormsModule,
    SpinnerComponent,
    MatTableModule,
    MatSort,
    MatChip,
    TitleCasePipe,
    MatIcon,
    MatPaginator,
    DatePipe,
    RouterLink,
  ],
  templateUrl: './requests.component.html',
  styleUrl: './requests.component.scss',
})
export class RequestsComponent implements AfterViewInit {
  public readonly displayedColumns: string[] = [
    'created_at',
    'amount',
    'status',
    'more',
  ];
  public searchValue = new FormControl('');
  public categoryControl = new FormControl('');
  public categoryFilters = [
    { value: 'Professional Course', label: 'Professional Course' },
  ];
  public isLoadingResults = false;
  public totalItems = 0;
  public page = new FormControl(1);
  private readonly destroy = new Subject<void>();
  public statusFilters = requestFilters;
  public statusControl = new FormControl('');
  public data: Disbursement[] = [];

  constructor(
    private readonly financeService: FinanceService,
    private readonly dialog: MatDialog,
    private readonly toastrService: ToastrService
  ) {}

  ngAfterViewInit() {
    combineLatest([
      this.page.valueChanges.pipe(startWith(1)),
      this.statusControl.valueChanges.pipe(startWith('')),
    ])
      .pipe(
        takeUntil(this.destroy),
        debounceTime(1000),
        switchMap(([page, status]) => {
          this.isLoadingResults = true;
          return this.financeService
            .getBeneficiaryDisbursements(page || 1, status || '')
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

  onPaginationChange(event: PageEvent): void {
    this.page.setValue(event.pageIndex + 1);
  }

  delete(id: string) {
    const data: ActionModalData = {
      actionIllustration: ActionModalIllustration.delete,
      title: 'Delete Request',
      actionColor: 'warn',
      subtext: 'are you sure you want to delete this request from the system?',
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
              'Disbursement request has successfully been deleted from the system',
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
}
