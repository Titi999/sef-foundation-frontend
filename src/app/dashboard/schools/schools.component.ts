import { DatePipe, TitleCasePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatButtonToggle } from '@angular/material/button-toggle';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatChip } from '@angular/material/chips';
import {
  MatSuffix,
  MatFormField,
  MatLabel,
  MatPrefix,
} from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { schools } from '@app/libs/constants';
import { RoundedInputComponent } from '@app/shared/rounded-input/rounded-input.component';
import { Subject, first, tap } from 'rxjs';
import { ngxCsv } from 'ngx-csv/ngx-csv';
import { AddSchoolComponent } from './add-school/add-school.component';
import { MatDialog } from '@angular/material/dialog';

interface School {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  created_at: string;
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
  // TODO: update laoding state once we have real data set
  public isLoadingResults = false;
  public data: School[] = [];
  public readonly displayedColumns: string[] = [
    'created_at',
    'name',
    'email',
    'phone',
    'location',
    'more',
  ];
  public totalItems = 0;
  private readonly destroy = new Subject<void>();
  public page = new FormControl(1);

  constructor(private readonly dialog: MatDialog) {}

  ngOnInit(): void {
    this.data = schools;
  }

  ngOnDestroy() {
    this.destroy.next();
    this.destroy.complete();
  }

  onPaginationChange(event: PageEvent): void {
    this.page.setValue(event.pageIndex + 1);
  }

  downloadCSV() {
    new ngxCsv(this.data, 'schools', {
      headers: ['ID', 'NAME', 'EMAIL', 'PHONE', 'LOCATION', 'DATE CREATED'],
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
}
