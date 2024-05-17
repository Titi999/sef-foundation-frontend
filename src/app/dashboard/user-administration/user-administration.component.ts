import { Component, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
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
  merge,
  of as observableOf,
  Subject,
  takeUntil,
} from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatButtonToggle } from '@angular/material/button-toggle';
import { FormControl, FormsModule } from '@angular/forms';
import {
  MatFormField,
  MatInput,
  MatLabel,
  MatPrefix,
  MatSuffix,
} from '@angular/material/input';
import {
  MatButton,
  MatFabButton,
  MatIconButton,
  MatMiniFabButton,
} from '@angular/material/button';
import { RoundedInputComponent } from '@app/shared/rounded-input/rounded-input.component';
import { UserAdministrationService } from '@app/dashboard/user-administration/user-administration.service';
import { User } from '@app/types/user';
import { MatChip } from '@angular/material/chips';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { AddUserComponent } from '@app/dashboard/user-administration/add-user/add-user.component';

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
    MatFabButton,
    MatButton,
    MatMiniFabButton,
    MatChip,
    TitleCasePipe,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
  ],
})
export class UserAdministrationComponent implements AfterViewInit, OnDestroy {
  displayedColumns: string[] = [
    'created_at',
    'name',
    'email',
    'role',
    'status',
    'more',
  ];
  // exampleDatabase!: ExampleHttpDatabase | null;
  data: User[] = [];

  totalItems = 0;
  isLoadingResults = true;
  searchValue = new FormControl('');
  private readonly destroy = new Subject<void>();
  page = new FormControl(1);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private readonly userAdministrationService: UserAdministrationService,
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
          return this.userAdministrationService!.getUsers(search).pipe(
            catchError(() => observableOf(null))
          );
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
    this.dialog.open(AddUserComponent);
  }
}
