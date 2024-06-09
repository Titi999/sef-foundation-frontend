import { AfterViewInit, Component } from '@angular/core';
import { CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { RoundedInputComponent } from '@app/shared/rounded-input/rounded-input.component';
import { MatMenuModule } from '@angular/material/menu';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import {
  combineLatest,
  debounceTime,
  of as observableOf,
  Subject,
  takeUntil,
} from 'rxjs';
import { SpinnerComponent } from '@app/shared/spinner/spinner.component';
import { Disbursement } from '@app/dashboard/finance/disbursement/disbursement.interface';
import { MatTableModule } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatChip } from '@angular/material/chips';
import { MatIcon } from '@angular/material/icon';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { RouterLink } from '@angular/router';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { FinanceService } from '@app/dashboard/finance/finance.service';

@Component({
  selector: 'app-requests',
  standalone: true,
  imports: [
    CurrencyPipe,
    RoundedInputComponent,
    MatMenuModule,
    MatButtonModule,
    MatRadioGroup,
    MatRadioButton,
    ReactiveFormsModule,
    SpinnerComponent,
    MatTableModule,
    MatSort,
    MatChip,
    TitleCasePipe,
    MatIcon,
    MatPaginator,
    DatePipe,
    RouterLink,
  ],
  templateUrl: './requests.component.html',
  styleUrl: './requests.component.scss',
})
export class RequestsComponent implements AfterViewInit {
  public readonly displayedColumns: string[] = [
    'created_at',
    'amount',
    'status',
    'more',
  ];
  public searchValue = new FormControl('');
  public categoryControl = new FormControl('');
  public categoryFilters = [
    { value: 'Professional Course', label: 'Professional Course' },
  ];
  public isLoadingResults = false;
  public totalItems = 0;
  public page = new FormControl(1);
  private readonly destroy = new Subject<void>();
  public statusFilters = [
    { value: '', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'declined', label: 'Declined' },
  ];
  public statusControl = new FormControl('');
  public data: Disbursement[] = [];

  constructor(private readonly financeService: FinanceService) {}

  ngAfterViewInit() {
    combineLatest([
      this.page.valueChanges.pipe(startWith(1)),
      this.statusControl.valueChanges.pipe(startWith('')),
    ])
      .pipe(
        takeUntil(this.destroy),
        debounceTime(1000),
        switchMap(([page, status]) => {
          this.isLoadingResults = true;
          return this.financeService
            .getBeneficiaryDisbursements(page || 1, status || '')
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

  onPaginationChange(event: PageEvent): void {
    this.page.setValue(event.pageIndex + 1);
  }
}
