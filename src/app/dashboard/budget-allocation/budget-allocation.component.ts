import {
  AfterViewInit,
  Component,
  inject,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { AsyncPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { MatCardModule } from '@angular/material/card';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
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
import { BudgetAllocationService } from '@app/dashboard/budget-allocation/budget-allocation.service';
import { BudgetAllocation } from '@app/dashboard/budget-allocation/budget-allocation.interface';
import { UserAdministrationService } from '@app/dashboard/user-administration/user-administration.service';

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
  ],
  templateUrl: './budget-allocation.component.html',
  styleUrl: './budget-allocation.component.scss',
})
export class BudgetAllocationComponent implements AfterViewInit, OnDestroy {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
  private breakpointObserver = inject(BreakpointObserver);

  cards = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
    map(({ matches }) => {
      if (matches) {
        return [
          { title: 'Card 1', cols: 1, rows: 1, id: 1 },
          { title: 'Card 2', cols: 1, rows: 1, id: 2 },
          { title: 'Card 3', cols: 1, rows: 1, id: 3 },
        ];
      }

      return [
        {
          title: 'Budget allocated',
          cols: 1,
          rows: 1,
          id: 1,
        },
        {
          title: 'Budget Utilized',
          cols: 1,
          rows: 1,
          id: 2,
        },
        {
          title: 'Surplus/Deficit',
          cols: 1,
          rows: 1,
          id: 3,
        },
      ];
    })
  );

  public readonly displayedColumns: string[] = [
    'created_at',
    'name',
    'email',
    'role',
    'status',
    'more',
  ];
  public data: BudgetAllocation[] = [];
  public totalItems = 0;
  public isLoadingResults = true;
  public searchValue = new FormControl('');
  private readonly destroy = new Subject<void>();
  public page = new FormControl(1);
  public roleControl = new FormControl('');
  public statusControl = new FormControl('');
  public rolesFilters = [
    { label: 'All', value: '' },
    { label: 'Super Admin', value: UserRoles.SUPER_ADMIN },
    { label: 'Admin', value: UserRoles.ADMIN },
    { label: 'Beneficiary', value: UserRoles.BENEFICIARY },
  ];
  public statusFilters = statusFilters;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private readonly budgetAllocationService: BudgetAllocationService,
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
          return this.budgetAllocationService
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

  addUser() {
    const dialogRef = this.dialog.open(AddUserComponent, {
      maxWidth: '400px',
      maxHeight: '400px',
      width: '100%',
      height: '100%',
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

  ediUser(user: User) {
    const data: AddUser & { id: string } = {
      id: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
    };
    const dialogRef = this.dialog.open(AddUserComponent, {
      maxWidth: '400px',
      maxHeight: '400px',
      width: '100%',
      height: '100%',
      data,
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

  deleteUser(id: string) {
    const data: ActionModalData = {
      actionIllustration: ActionModalIllustration.delete,
      title: 'Delete user',
      actionColor: 'warn',
      subtext: 'are you sure you want to delete this user from the system?',
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
        switchMap(() => this.userAdministrationService.deleteUser(id)),
        tap(() => {
          dialogRef.componentInstance.isLoading = false;
          dialogRef.close();
          this.page.setValue(1);
          const data: ActionModalData = {
            actionIllustration: ActionModalIllustration.delete,
            title: 'completed',
            actionColor: 'warn',
            subtext: 'The user has successfully been delete from the system',
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

  changeStatus(status: string, id: string) {
    const isActivate = status === 'active';
    const data: ActionModalData = {
      actionIllustration: isActivate
        ? ActionModalIllustration.deactivate
        : ActionModalIllustration.activate,
      title: isActivate ? 'Deactivate user' : 'Activate user',
      actionColor: isActivate ? 'warn' : 'primary',
      subtext: isActivate
        ? 'are you sure you want to deactivate this user?'
        : 'are you sure you want activate this for the role?',
      actionType: 'decision',
      decisionText: isActivate ? 'Deactivate' : 'Activate',
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
          dialogRef.componentInstance.isLoading = true;
          dialogRef.disableClose = true;
        }),
        switchMap(() => this.userAdministrationService.changeStatus(id)),
        tap(response => {
          dialogRef.componentInstance.isLoading = false;
          dialogRef.close();
          const isActive = response.data.status === 'active';
          this.page.setValue(1);
          const data: ActionModalData = {
            actionIllustration: isActive
              ? ActionModalIllustration.success
              : ActionModalIllustration.deactivate,
            title: isActive ? 'Congratulations!' : 'Completed',
            actionColor: isActive ? 'primary' : 'warn',
            subtext: isActive
              ? 'you have successfully activated the new user'
              : 'The user has been successfully deactivated',
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
    new ngxCsv(this.data, 'users', {
      headers: [
        'ID',
        'EMAIL',
        'NAME',
        'ROLE',
        'STATUS',
        'PERMISSIONS',
        'REMEMBER TOKEN',
        'DATE EMAIL VERIFIED',
        'FIRST LOGIN',
        'DATE CREATED',
        'DATE UPDATED',
      ],
    });
  }
}
