import { DatePipe, TitleCasePipe } from '@angular/common';
import {
  AfterViewInit,
  Component,
  OnDestroy,
  ViewChild,
  WritableSignal,
  signal,
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatButtonToggle } from '@angular/material/button-toggle';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatChip } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import {
  MatFormField,
  MatLabel,
  MatPrefix,
  MatSuffix,
} from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { RoundedInputComponent } from '@app/shared/rounded-input/rounded-input.component';
import { ngxCsv } from 'ngx-csv/ngx-csv';
import { ToastrService } from 'ngx-toastr';
import {
  Subject,
  catchError,
  combineLatest,
  debounceTime,
  filter,
  finalize,
  first,
  map,
  of,
  startWith,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { AddSchoolComponent } from './add-school/add-school.component';
import { SchoolService } from './school.service';
import {
  ActionModalData,
  ActionModalIllustration,
} from '@app/shared/action-modal/action-modal.type';
import { ActionModalComponent } from '@app/shared/action-modal/action-modal.component';
import { serverError, statusFilters } from '@app/libs/constants';

interface School {
  name: string;
  email: string;
  phone: string;
  location: string;
  status: string;
  id: string;
}

@Component({
  selector: 'app-schools',
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
    MatInput,
  ],
  templateUrl: './schools.component.html',
  styleUrl: './schools.component.scss',
})
export class SchoolsComponent implements OnDestroy, AfterViewInit {
  public searchValue = new FormControl('');
  public statusControl = new FormControl('');
  public isLoadingResults = false;
  public data: WritableSignal<School[]> = signal([]);
  public readonly displayedColumns: string[] = [
    'name',
    'email',
    'phone',
    'location',
    'status',
    'more',
  ];
  public totalItems = 0;
  private readonly destroy = new Subject<void>();
  public page = new FormControl(1);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private readonly dialog: MatDialog,
    private readonly schoolService: SchoolService,
    private readonly toastrService: ToastrService
  ) {}

  ngAfterViewInit(): void {
    this.getAllSchools();
  }

  ngOnDestroy() {
    this.destroy.next();
    this.destroy.complete();
  }

  onPaginationChange(event: PageEvent): void {
    this.page.setValue(event.pageIndex + 1);
  }

  downloadCSV() {
    new ngxCsv(this.data(), 'Schools', {
      headers: ['ID', 'NAME', 'EMAIL', 'PHONE', 'LOCATION', 'STATUS'],
    });
  }

  public addSchool() {
    const dialogRef = this.dialog.open(AddSchoolComponent, {
      maxWidth: '400px',
      maxHeight: '530px',
      width: '100%',
      height: '100%',
    });
    dialogRef
      .afterClosed()
      .pipe(
        first(),
        tap((school: School) => {
          if (school) {
            this.page.setValue(1);
          }
        })
      )
      .subscribe();
  }

  public getAllSchools() {
    combineLatest([
      this.searchValue.valueChanges.pipe(
        startWith(''),
        filter((searchValue): searchValue is string => searchValue !== null)
      ),
      this.page.valueChanges.pipe(startWith(1)),
      this.statusControl.valueChanges.pipe(startWith('')),
      this.paginator.page.pipe(startWith(new PageEvent())),
    ])
      .pipe(
        takeUntil(this.destroy),
        debounceTime(1000),
        switchMap(([search, page, status]) => {
          this.isLoadingResults = true;
          return this.schoolService
            .getSchools(page || 1, search, status || '')
            .pipe(catchError(() => of(null)));
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
      .subscribe(data => {
        if (data) {
          this.data.set(data);
        }
      });
  }

  public editSchool(school: School) {
    const data: School = school;
    const dialogRef = this.dialog.open(AddSchoolComponent, {
      maxWidth: '500px',
      maxHeight: '500px',
      width: '100%',
      height: '100%',
      data,
    });
    dialogRef
      .afterClosed()
      .pipe(
        first(),
        tap((school: School) => {
          if (school) {
            this.page.setValue(1);
          }
        })
      )
      .subscribe();
  }

  public deleteSchool(id: string) {
    const data: ActionModalData = {
      actionIllustration: ActionModalIllustration.delete,
      title: 'Delete school',
      actionColor: 'warn',
      subtext: 'are you sure you want to delete this school from the system?',
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
        first(),
        finalize(() => {
          dialogRef.componentInstance.isLoading = false;
          dialogRef.disableClose = false;
        }),
        tap(() => {
          dialogRef.disableClose = true;
          dialogRef.componentInstance.isLoading = true;
        }),
        switchMap(() => this.schoolService.deleteSchool(id)),
        tap(() => {
          dialogRef.componentInstance.isLoading = false;
          dialogRef.close();
          this.page.setValue(1);
          const data: ActionModalData = {
            actionIllustration: ActionModalIllustration.delete,
            title: 'completed',
            actionColor: 'warn',
            subtext: 'The school has successfully been deleted from the system',
            actionType: 'close',
          };
          this.dialog.open(ActionModalComponent, {
            maxWidth: '400px',
            maxHeight: '400px',
            width: '100%',
            height: '100%',
            data,
          });
        }),
        catchError(error => {
          dialogRef.close();
          console.log(error, 'error');
          this.toastrService.error(
            error.error.message,
            error.error.error || serverError
          );
          return of(null);
        })
      )
      .subscribe();
  }

  changeStatus(status: 'active' | 'inactive', id: string) {
    const isActivate = status === 'active';
    const data: ActionModalData = {
      actionIllustration: isActivate
        ? ActionModalIllustration.deactivate
        : ActionModalIllustration.activate,
      title: isActivate ? 'Deactivate user' : 'Activate user',
      actionColor: isActivate ? 'warn' : 'primary',
      subtext: isActivate
        ? 'are you sure you want to deactivate this school?'
        : 'are you sure you want to activate this school?',
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

    const request = isActivate
      ? this.schoolService.deactivateSchool(id)
      : this.schoolService.activateSchool(id);

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
          const isActive = response.data.status === 'active';
          this.page.setValue(1);
          const data: ActionModalData = {
            actionIllustration: isActive
              ? ActionModalIllustration.success
              : ActionModalIllustration.deactivate,
            title: isActive ? 'Congratulations!' : 'Completed',
            actionColor: isActive ? 'primary' : 'warn',
            subtext: isActive
              ? 'you have successfully activated the school'
              : 'The school has been successfully deactivated',
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

  protected readonly statusFilters = statusFilters;
}
