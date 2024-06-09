import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { DatePipe, TitleCasePipe } from '@angular/common';
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
import { RoundedInputComponent } from '@app/shared/rounded-input/rounded-input.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ngxCsv } from 'ngx-csv';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { Student } from '@app/dashboard/students/students.interface';
import { MatSort } from '@angular/material/sort';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
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
import { StudentsService } from '@app/dashboard/students/students.service';
import { User } from '@app/auth/auth.type';
import { AddStudentComponent } from '@app/dashboard/students/add-student/add-student.component';
import { MatDialog } from '@angular/material/dialog';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { serverError, statusFilters } from '@app/libs/constants';
import { Router } from '@angular/router';
import {
  ActionModalData,
  ActionModalIllustration,
} from '@app/shared/action-modal/action-modal.type';
import { ActionModalComponent } from '@app/shared/action-modal/action-modal.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [
    DatePipe,
    MatButton,
    MatCell,
    MatCellDef,
    MatChip,
    MatColumnDef,
    MatHeaderCell,
    RoundedInputComponent,
    MatProgressSpinner,
    MatTable,
    MatSort,
    MatHeaderCellDef,
    TitleCasePipe,
    MatMenuTrigger,
    MatIconButton,
    MatIcon,
    MatMenu,
    MatMenuItem,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatPaginator,
    MatRadioButton,
    MatRadioGroup,
    ReactiveFormsModule,
  ],
  templateUrl: './students.component.html',
  styleUrl: './students.component.scss',
})
export class StudentsComponent implements AfterViewInit, OnDestroy {
  public readonly displayedColumns: string[] = [
    'created_at',
    'name',
    'school',
    'class',
    'parent',
    'status',
    'more',
  ];
  public searchValue = new FormControl('');
  public isLoadingResults = true;
  public data: Student[] = [];
  public totalItems = 0;
  public page = new FormControl(1);
  private readonly destroy = new Subject<void>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  public statusControl = new FormControl('');
  public statusFilters = statusFilters;

  constructor(
    private readonly studentsService: StudentsService,
    private readonly dialog: MatDialog,
    private readonly router: Router,
    private readonly toastrService: ToastrService
  ) {}

  ngAfterViewInit() {
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
          return this.studentsService
            .getStudents(page || 1, search, status || '')
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

  downloadCSV() {
    const data = this.data.map(student => {
      return {
        id: student.id,
        name: student.name,
        parent: student.parent,
        school: student.school.name,
        class: student.level,
        phone: student.phone,
        status: student.status,
        dateCreated: student.created_at,
        updatedAt: student.updated_at,
      };
    });
    new ngxCsv(data, 'students', {
      headers: [
        'ID',
        'NAME',
        'PARENT',
        'SCHOOL',
        'CLASS',
        'PHONE NUMBER',
        'STATUS',
        'DATE CREATED',
        'DATE UPDATED',
      ],
    });
  }

  addStudent() {
    const dialogRef = this.dialog.open(AddStudentComponent, {
      maxWidth: '500px',
      maxHeight: '700px',
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

  editStudent(student: Student) {
    const data: Student = student;
    const dialogRef = this.dialog.open(AddStudentComponent, {
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
        tap((student: Student) => {
          if (student) {
            this.page.setValue(1);
          }
        })
      )
      .subscribe();
  }

  onPaginationChange(event: PageEvent) {
    this.page.setValue(event.pageIndex + 1);
  }

  selectStudent(student: Student) {
    void this.router.navigateByUrl(`dashboard/student-profile/${student.id}`);
  }

  deleteStudent(id: string) {
    const data: ActionModalData = {
      actionIllustration: ActionModalIllustration.delete,
      title: 'Delete student',
      actionColor: 'warn',
      subtext: 'are you sure you want to delete this student from the system?',
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
        switchMap(() => this.studentsService.deleteStudent(id)),
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

  changeStatus(status: string, id: string) {
    const isActive = status === 'active';
    const data: ActionModalData = {
      actionIllustration: isActive
        ? ActionModalIllustration.deactivate
        : ActionModalIllustration.activate,
      title: isActive ? 'Deactivate student' : 'Activate student',
      actionColor: isActive ? 'warn' : 'primary',
      subtext: isActive
        ? 'are you sure you want to deactivate this student?'
        : 'are you sure you want to activate this student?',
      actionType: 'decision',
      decisionText: isActive ? 'Deactivate' : 'Activate',
    };
    const dialogRef = this.dialog.open(ActionModalComponent, {
      maxWidth: '400px',
      maxHeight: '400px',
      width: '100%',
      height: '100%',
      data,
    });
    const request = isActive
      ? this.studentsService.deactivateStudent(id)
      : this.studentsService.activateStudent(id);

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
            title: isActive ? 'Success!' : 'Completed',
            actionColor: isActive ? 'primary' : 'warn',
            subtext: isActive
              ? 'you have successfully activated student'
              : 'The student has been successfully deactivated',
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
