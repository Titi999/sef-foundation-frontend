import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { serverError, statusFilters, termList } from '@app/libs/constants';
import { PerformanceService } from '@app/dashboard/performance/performance.service';
import { ToastrService } from 'ngx-toastr';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BeneficiaryAcademicPerformance } from '@app/dashboard/performance/performance.interface';
import {
  combineLatest,
  debounceTime,
  filter,
  finalize,
  first,
  of,
  startWith,
  Subject,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { catchError } from 'rxjs/operators';
import { ngxCsv } from 'ngx-csv';
import { SpinnerComponent } from '@app/shared/spinner/spinner.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { AvatarModule } from 'ngx-avatars';
import { RoundedInputComponent } from '@app/shared/rounded-input/rounded-input.component';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { getYearsDropDownValues } from '@app/libs/util';
import { User } from '@app/auth/auth.type';
import { MatDialog } from '@angular/material/dialog';
import { AddPerformanceComponent } from '@app/dashboard/performance/beneficiary-academics/add-performance/add-performance.component';
import { TitleCasePipe } from '@angular/common';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import {
  ActionModalData,
  ActionModalIllustration,
} from '@app/shared/action-modal/action-modal.type';
import { ActionModalComponent } from '@app/shared/action-modal/action-modal.component';

@Component({
  selector: 'app-beneficiary-academics',
  standalone: true,
  imports: [
    SpinnerComponent,
    MatSelect,
    MatOption,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    AvatarModule,
    RoundedInputComponent,
    MatIcon,
    MatButton,
    MatPaginator,
    MatIconButton,
    MatTableModule,
    TitleCasePipe,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
  ],
  templateUrl: './beneficiary-academics.component.html',
  styleUrl: './beneficiary-academics.component.scss',
})
export class BeneficiaryAcademicsComponent implements OnInit {
  private performanceService = inject(PerformanceService);
  private toastrService = inject(ToastrService);
  private readonly dialog = inject(MatDialog);
  public searchControl = new FormControl('');
  public termControl = new FormControl('');
  public isLoadingResults = false;
  public yearControl = new FormControl('');
  public data: BeneficiaryAcademicPerformance[] = [];
  public readonly displayedColumns: string[] = [
    'course',
    'score',
    'grade',
    'term',
    'year',
    'more',
  ];
  public totalItems = 0;
  public page = new FormControl(1);
  private readonly destroy = new Subject<void>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  public statusControl = new FormControl('');
  public statusFilters = statusFilters;

  ngOnInit() {
    this.getAcademicsPerformance();
  }

  addAcademicPerformance() {
    const dialogRef = this.dialog.open(AddPerformanceComponent, {
      maxWidth: '500px',
      maxHeight: '600px',
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

  editAcademicPerformance(performance: BeneficiaryAcademicPerformance) {
    const data = performance;
    const dialogRef = this.dialog.open(AddPerformanceComponent, {
      maxWidth: '500px',
      maxHeight: '700px',
      width: '100%',
      height: '100%',
      data,
    });
    dialogRef
      .afterClosed()
      .pipe(
        first(),
        tap((performance: BeneficiaryAcademicPerformance) => {
          if (performance) {
            this.page.setValue(1);
          }
        })
      )
      .subscribe();
  }

  deleteStudent(id: string) {
    const data: ActionModalData = {
      actionIllustration: ActionModalIllustration.delete,
      title: 'Delete student',
      actionColor: 'warn',
      subtext: 'are you sure you want to delete this record from the system?',
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
          this.performanceService.deleteBeneficiaryAcademicPerformance(id)
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
              'The academic reocrd has successfully been deleted from the system',
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

  getAcademicsPerformance() {
    this.isLoadingResults = true;
    combineLatest([
      this.searchControl.valueChanges.pipe(
        startWith(''),
        filter((searchValue): searchValue is string => searchValue !== null)
      ),
      this.page.valueChanges.pipe(startWith(1)),
      this.termControl.valueChanges.pipe(startWith('')),
      this.yearControl.valueChanges.pipe(startWith('')),
    ])
      .pipe(
        takeUntil(this.destroy),
        debounceTime(1000),
        switchMap(([search, page, term, year]) => {
          this.isLoadingResults = true;
          return this.performanceService
            .getBeneficiaryAcademicPerformance(
              search,
              page || 1,
              term || '',
              year || ''
            )
            .pipe(
              tap(({ data }) => {
                this.data = data.items;
                this.totalItems = data.total;
              }),
              finalize(() => (this.isLoadingResults = false)),
              catchError(error => {
                this.toastrService.error(
                  error.error.message,
                  error.error.error || serverError
                );
                return of(null);
              })
            );
        })
      )
      .subscribe();
  }

  downloadCSV() {
    new ngxCsv(this.data, 'SEF Academic Performance', {
      headers: [
        'STUDENT ID ',
        'STUDENT NAME',
        'CLASS / LEVEL',
        'SCHOOL',
        'TOTAL SCORE',
        'TOTAL COURSES',
        'TOTAL ACTUAL SCORE',
        'AVERAGE SCORE',
      ],
    });
  }
  protected readonly getYearsDropDownValues = getYearsDropDownValues;
  protected readonly Number = Number;
  protected readonly termList = termList.slice(1);
}
