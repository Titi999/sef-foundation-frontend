import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { RoundedInputComponent } from '@app/shared/rounded-input/rounded-input.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { ngxCsv } from 'ngx-csv';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSort } from '@angular/material/sort';
import { MatChip } from '@angular/material/chips';
import { MatIcon } from '@angular/material/icon';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { FinanceService } from '@app/dashboard/finance/finance.service';
import {
  combineLatest,
  debounceTime,
  of as observableOf,
  Subject,
  takeUntil,
} from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { Disbursement } from '@app/dashboard/finance/disbursement/disbursement.interface';

@Component({
  selector: 'app-disbursement',
  standalone: true,
  imports: [
    DatePipe,
    MatButton,
    RoundedInputComponent,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
    ReactiveFormsModule,
    MatRadioGroup,
    MatRadioButton,
    MatProgressSpinner,
    MatTableModule,
    MatChip,
    MatSort,
    TitleCasePipe,
    MatIcon,
    MatIconButton,
    MatPaginator,
  ],
  templateUrl: './disbursement.component.html',
  styleUrl: './disbursement.component.scss',
})
export class DisbursementComponent implements AfterViewInit, OnDestroy {
  public readonly displayedColumns: string[] = [
    'created_at',
    'name',
    'email',
    'role',
    'status',
    'more',
  ];
  public searchValue = new FormControl('');
  public categoryControl = new FormControl('');
  public statusControl = new FormControl('');
  public categoryFilters = [
    { value: 'Professional Course', label: 'Professional Course' },
  ];
  public statusFilters = [{ value: 'pending', label: 'Pending' }];
  public data: Disbursement[] = [];
  public isLoadingResults = false;
  public totalItems = 0;
  public page = new FormControl(1);
  private readonly destroy = new Subject<void>();

  constructor(private readonly financeService: FinanceService) {}

  ngAfterViewInit() {
    combineLatest([this.page.valueChanges.pipe(startWith(1))])
      .pipe(
        takeUntil(this.destroy),
        debounceTime(1000),
        switchMap(([page]) => {
          this.isLoadingResults = true;
          return this.financeService
            .getDisbursements(page || 1)
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
