import { DatePipe, TitleCasePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
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
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { serverError } from '@app/libs/constants';
import { RoundedInputComponent } from '@app/shared/rounded-input/rounded-input.component';
import { ngxCsv } from 'ngx-csv/ngx-csv';
import { ToastrService } from 'ngx-toastr';
import {
  Subject,
  catchError,
  finalize,
  first,
  map,
  of,
  takeUntil,
  tap,
} from 'rxjs';
import { AddSchoolComponent } from './add-school/add-school.component';
import { SchoolService } from './school.service';

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
  ],
  templateUrl: './schools.component.html',
  styleUrl: './schools.component.scss',
})
export class SchoolsComponent implements OnInit, OnDestroy {
  public searchValue = new FormControl('');
  public isLoadingResults = false;
  public data: School[] = [];
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

  constructor(
    private readonly dialog: MatDialog,
    private readonly schoolService: SchoolService,
    private readonly toastrService: ToastrService
  ) {}

  ngOnInit(): void {
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
    new ngxCsv(this.data, 'Schools', {
      headers: ['ID', 'NAME', 'EMAIL', 'PHONE', 'LOCATION', 'STATUS'],
    });
  }

  addSchool() {
    const dialogRef = this.dialog.open(AddSchoolComponent, {
      maxWidth: '400px',
      maxHeight: '480px',
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
    this.isLoadingResults = true;
    this.schoolService
      .getAllSchools()
      .pipe(
        catchError(error => {
          this.toastrService.error(
            error.error.message,
            error.error.error || serverError
          );
          return of(null);
        }),
        finalize(() => (this.isLoadingResults = false)),
        takeUntil(this.destroy),
        map(response => response?.data || [])
      )
      .subscribe(schools => (this.data = schools));
  }
}
