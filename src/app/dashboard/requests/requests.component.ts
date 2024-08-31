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
  first,
  of,
  of as observableOf,
  Subject,
  takeUntil,
  tap,
} from 'rxjs';
import { SpinnerComponent } from '@app/shared/spinner/spinner.component';
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
import {
  BudgetDistribution,
  IRequest,
} from '@app/dashboard/finance/budget-allocation/budget-allocation.interface';
import { CreateRequestComponent } from '@app/dashboard/requests/create-request/create-request.component';
import { calculateBudgetTotal } from '@app/libs/util';
import { AuthService } from '@app/auth/auth.service';
import { UserRoles } from '@app/auth/auth.type';

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
  displayedColumns: string[] = ['student', 'total', 'status', 'more'];
  public searchValue = new FormControl('');
  public isLoadingResults = false;
  public totalItems = 0;
  public page = new FormControl(1);
  private readonly destroy = new Subject<void>();
  public statusFilters = requestFilters;
  public statusControl = new FormControl('');
  public data: IRequest[] = [];
  public role = this.authService.role;

  constructor(
    private readonly financeService: FinanceService,
    private readonly dialog: MatDialog,
    private readonly toastrService: ToastrService,
    private readonly authService: AuthService
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
            .getRequest(page || 1, status || '')
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

  addRequest(request?: IRequest) {
    const dialogRef = this.dialog.open(CreateRequestComponent, {
      maxWidth: '100%',
      maxHeight: '100%',
      width: '100%',
      height: '100%',
      data: request,
    });
    dialogRef
      .afterClosed()
      .pipe(
        first(),
        tap(distribution => {
          if (distribution) {
            this.page.setValue(1);
          }
        })
      )
      .subscribe();
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
        switchMap(() => this.financeService.deleteRequest(id)),
        tap(() => {
          dialogRef.componentInstance.isLoading = false;
          dialogRef.close();
          this.page.setValue(1);
          const data: ActionModalData = {
            actionIllustration: ActionModalIllustration.delete,
            title: 'completed',
            actionColor: 'warn',
            subtext: 'Request has successfully been deleted from the system',
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

  approve(id: string) {
    const data: ActionModalData = {
      actionIllustration: ActionModalIllustration.activate,
      title: 'Approve Request',
      actionColor: 'primary',
      subtext: 'are you sure you want to approve this request from the system?',
      actionType: 'decision',
      decisionText: 'Approve',
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
        switchMap(() => this.financeService.approveRequest(id)),
        tap(() => {
          dialogRef.componentInstance.isLoading = false;
          dialogRef.close();
          this.page.setValue(1);
          const data: ActionModalData = {
            actionIllustration: ActionModalIllustration.success,
            title: 'completed',
            actionColor: 'primary',
            subtext: 'Request has successfully been approved',
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

  decline(id: string) {
    const data: ActionModalData = {
      actionIllustration: ActionModalIllustration.deactivate,
      title: 'Decline Request',
      actionColor: 'warn',
      subtext: 'are you sure you want to decline this request?',
      actionType: 'decision',
      decisionText: 'Decline',
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
        switchMap(() => this.financeService.declineRequest(id)),
        tap(() => {
          dialogRef.componentInstance.isLoading = false;
          dialogRef.close();
          this.page.setValue(1);
          const data: ActionModalData = {
            actionIllustration: ActionModalIllustration.success,
            title: 'completed',
            actionColor: 'warn',
            subtext: 'Request has successfully been declined',
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

  protected readonly calculateBudgetTotal = calculateBudgetTotal;
  protected readonly UserRoles = UserRoles;
}
