import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
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
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatButtonToggle } from '@angular/material/button-toggle';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatFormField,
  MatInput,
  MatLabel,
  MatPrefix,
  MatSuffix,
} from '@angular/material/input';
import { MatButton, MatIconButton } from '@angular/material/button';
import { RoundedInputComponent } from '@app/shared/rounded-input/rounded-input.component';
import { UserAdministrationService } from '@app/dashboard/user-administration/user-administration.service';
import { User, UserRoles } from '@app/auth/auth.type';
import { MatChip } from '@angular/material/chips';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { AddUserComponent } from '@app/dashboard/user-administration/add-user/add-user.component';
import { ActionModalComponent } from '@app/shared/action-modal/action-modal.component';
import {
  ActionModalData,
  ActionModalIllustration,
} from '@app/shared/action-modal/action-modal.type';
import { AddUser } from '@app/dashboard/user-administration/add-user/add-user.type';
import { serverError, statusFilters } from '@app/libs/constants';
import { ToastrService } from 'ngx-toastr';
import { ngxCsv } from 'ngx-csv/ngx-csv';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';

@Component({
  selector: 'app-user-administration',
  styleUrl: 'user-administration.component.scss',
  templateUrl: 'user-administration.component.html',
  standalone: true,
  imports: [
    MatProgressSpinnerModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    DatePipe,
    MatIcon,
    MatButtonToggle,
    FormsModule,
    MatInput,
    MatSuffix,
    MatIconButton,
    MatFormField,
    MatLabel,
    MatPrefix,
    RoundedInputComponent,
    MatButton,
    MatChip,
    TitleCasePipe,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
    MatCheckbox,
    MatRadioButton,
    MatRadioGroup,
    ReactiveFormsModule,
  ],
})
export class UserAdministrationComponent implements AfterViewInit, OnDestroy {
  public readonly displayedColumns: string[] = [
    'created_at',
    'name',
    'email',
    'role',
    'status',
    'deactivated_at',
    'more',
  ];
  public data: User[] = [];
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
    private readonly userAdministrationService: UserAdministrationService,
    private readonly dialog: MatDialog,
    private toastrService: ToastrService
  ) {}

  ngAfterViewInit() {
    combineLatest([
      this.searchValue.valueChanges.pipe(
        startWith(''),
        filter((searchValue): searchValue is string => searchValue !== null)
      ),
      this.page.valueChanges.pipe(startWith(1)),
      this.roleControl.valueChanges.pipe(startWith('')),
      this.statusControl.valueChanges.pipe(startWith('')),
      this.paginator.page.pipe(startWith(new PageEvent())),
    ])
      .pipe(
        takeUntil(this.destroy),
        debounceTime(1000),
        switchMap(([search, page, role, status]) => {
          this.isLoadingResults = true;
          return this.userAdministrationService!.getUsers(
            page || 1,
            search,
            role || '',
            status || ''
          ).pipe(catchError(() => observableOf(null)));
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
      maxHeight: '500px',
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
        : 'are you sure you want to activate this for the role?',
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
    const data = this.data.map(user => {
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        dateCreated: user.created_at,
      };
    });

    new ngxCsv(data, 'users', {
      headers: ['ID', 'EMAIL', 'NAME', 'ROLE', 'STATUS', 'DATE CREATED'],
    });
  }
}
