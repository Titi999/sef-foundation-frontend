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
import { FormControl } from '@angular/forms';
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
  first,
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

  constructor(
    private readonly studentsService: StudentsService,
    private readonly dialog: MatDialog
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
        switchMap(([search, sort, page]) => {
          console.log(sort, 'sort');
          console.log(page, 'paginator');
          console.log(search, 'search');
          this.isLoadingResults = true;
          return this.studentsService
            .getStudents(this.page.value?.toString() || '1', search)
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
    new ngxCsv(this.data, 'students', {
      headers: [
        'ID',
        'NAME',
        'PARENT',
        'SCHOOL',
        'CLASS',
        'PERMISSIONS',
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

  deleteStudent(id: string) {
    console.log(id);
  }

  onPaginationChange(event: PageEvent) {
    console.log(event);
  }
}
