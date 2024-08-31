import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { SpinnerComponent } from '@app/shared/spinner/spinner.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { InfoCardComponent } from '@app/shared/info-card/info-card.component';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MatFormField,
  MatPrefix,
  MatSuffix,
} from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatInput, MatLabel } from '@angular/material/input';
import { BannerComponent } from '@app/shared/banner/banner.component';
import {
  catchError,
  finalize,
  first,
  of,
  ReplaySubject,
  Subject,
  takeUntil,
} from 'rxjs';
import { AsyncPipe, CurrencyPipe, NgForOf } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogClose,
  MatDialogRef,
} from '@angular/material/dialog';
import { FinanceService } from '@app/dashboard/finance/finance.service';
import { ToastrService } from 'ngx-toastr';
import {
  MatAutocomplete,
  MatAutocompleteTrigger,
} from '@angular/material/autocomplete';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
} from '@angular/material/table';
import { MatChip } from '@angular/material/chips';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { ZeroPadPipe } from '@app/pipes/zero-pad.pipe';
import {
  BudgetAllocation,
  CreateRequest,
  IRequest,
} from '@app/dashboard/finance/budget-allocation/budget-allocation.interface';
import { serverError } from '@app/libs/constants';
import {
  ActionModalData,
  ActionModalIllustration,
} from '@app/shared/action-modal/action-modal.type';
import { ActionModalComponent } from '@app/shared/action-modal/action-modal.component';

@Component({
  selector: 'app-create-request',
  standalone: true,
  imports: [
    SpinnerComponent,
    MatIconModule,
    MatButton,
    InfoCardComponent,
    ReactiveFormsModule,
    MatFormField,
    MatSelect,
    MatInput,
    MatPrefix,
    MatSuffix,
    BannerComponent,
    MatDialogClose,
    MatIconButton,
    MatLabel,
    AsyncPipe,
    CurrencyPipe,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatCell,
    MatCellDef,
    MatChip,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatOption,
    MatRow,
    MatRowDef,
    MatSlideToggle,
    MatTable,
    NgForOf,
    NgxMatSelectSearchModule,
    ZeroPadPipe,
  ],
  templateUrl: './create-request.component.html',
  styleUrl: './create-request.component.scss',
})
export class CreateRequestComponent implements OnDestroy, OnInit {
  isLoading: boolean = false;
  requestForm = this.fb.group({
    budgetId: ['', Validators.required],
    school: ['', Validators.required],
    class: ['', Validators.required],
    tuition: ['', Validators.required],
    textBooks: ['', Validators.required],
    extraClasses: ['', Validators.required],
    examFee: ['', Validators.required],
    uniformBag: ['', Validators.required],
    excursion: ['', Validators.required],
    transportation: ['', Validators.required],
    wears: ['', Validators.required],
    schoolFeeding: ['', Validators.required],
    stationery: ['', Validators.required],
    provision: ['', Validators.required],
    homeCare: ['', Validators.required],
  });
  isLoadingBudget = false;
  public isLoadingStudents = true;
  protected budgets: BudgetAllocation[] = [];
  public budgetsFilterCtrl = new FormControl<string>('');
  public filteredBudgets: ReplaySubject<BudgetAllocation[]> = new ReplaySubject<
    BudgetAllocation[]
  >(1);
  protected _onDestroy = new Subject<void>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly financeService: FinanceService,
    private readonly toastrService: ToastrService,
    private readonly dialog: MatDialog,
    private dialogRef: MatDialogRef<CreateRequestComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: IRequest
  ) {
    if (data) {
      const {
        school,
        tuition,
        textBooks,
        extraClasses,
        examFee,
        excursion,
        uniformBag,
        transportation,
        wears,
        schoolFeeding,
        stationery,
        provision,
        homeCare,
      } = data;
      this.requestForm.controls.class.setValue(data.class);
      this.requestForm.controls.school.setValue(school);
      this.requestForm.controls.tuition.setValue(String(tuition));
      this.requestForm.controls.textBooks.setValue(String(textBooks));
      this.requestForm.controls.extraClasses.setValue(String(extraClasses));
      this.requestForm.controls.examFee.setValue(String(examFee));
      this.requestForm.controls.excursion.setValue(String(excursion));
      this.requestForm.controls.uniformBag.setValue(String(uniformBag));
      this.requestForm.controls.transportation.setValue(String(transportation));
      this.requestForm.controls.wears.setValue(String(wears));
      this.requestForm.controls.schoolFeeding.setValue(String(schoolFeeding));
      this.requestForm.controls.stationery.setValue(String(stationery));
      this.requestForm.controls.provision.setValue(String(provision));
      this.requestForm.controls.homeCare.setValue(String(homeCare));
      this.requestForm.controls.budgetId.setValue(data.__budget__.id);
    }
  }

  ngOnInit() {
    this.financeService
      .getAllBudgets()
      .pipe(
        first(),
        catchError(error => {
          this.toastrService.error(
            error.error.message,
            error.error.error || serverError
          );
          return of(null);
        }),
        finalize(() => {
          this.isLoadingStudents = false;
        })
      )
      .subscribe(response => {
        if (response) {
          this.budgets = response.data;
          this.filteredBudgets.next(response.data.slice());
        }
      });
    this.budgetsFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterStudents();
      });
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  public updateTotal() {
    const form = this.requestForm.value as CreateRequest;
    const fieldsToSum: (keyof CreateRequest)[] = [
      'tuition',
      'textBooks',
      'extraClasses',
      'examFee',
      'uniformBag',
      'excursion',
      'transportation',
      'wears',
      'schoolFeeding',
      'stationery',
      'provision',
      'homeCare',
    ];

    return fieldsToSum.reduce((total, field) => {
      const value = parseFloat((form[field] as string) || '0');
      return total + (isNaN(value) ? 0 : value);
    }, 0);
  }

  protected filterStudents() {
    if (!this.budgets) {
      return;
    }
    let search = this.budgetsFilterCtrl.value as string;
    if (!search) {
      this.filteredBudgets.next(this.budgets.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.filteredBudgets.next(
      this.budgets.filter(
        budget => budget.period.toLowerCase().indexOf(search) > -1
      )
    );
  }

  submit() {
    const request = {
      budgetId: this.requestForm.controls.budgetId.value,
      school: this.requestForm.controls.school.value,
      class: this.requestForm.controls.class.value,
      tuition: Number(this.requestForm.controls.tuition.value),
      textBooks: Number(this.requestForm.controls.textBooks.value),
      extraClasses: Number(this.requestForm.controls.extraClasses.value),
      examFee: Number(this.requestForm.controls.examFee.value),
      uniformBag: Number(this.requestForm.controls.uniformBag.value),
      excursion: Number(this.requestForm.controls.excursion.value),
      transportation: Number(this.requestForm.controls.transportation.value),
      wears: Number(this.requestForm.controls.wears.value),
      schoolFeeding: Number(this.requestForm.controls.schoolFeeding.value),
      stationery: Number(this.requestForm.controls.stationery.value),
      provision: Number(this.requestForm.controls.provision.value),
      homeCare: Number(this.requestForm.controls.homeCare.value),
    } as CreateRequest;
    if (this.requestForm.valid) {
      this.isLoading = true;
      if (this.data) {
        this.financeService
          .editRequest(this.data.id, request)
          .pipe(
            first(),
            catchError(error => {
              this.toastrService.error(
                error.error.message,
                error.error.error || serverError
              );
              return of(null);
            }),
            finalize(() => {
              this.isLoading = false;
            })
          )
          .subscribe(response => {
            if (response) {
              this.dialogRef.close(response);
              const data: ActionModalData = {
                actionIllustration: ActionModalIllustration.success,
                title: 'Congratulations!',
                actionColor: 'primary',
                subtext: 'Well done, You have successfully updated a request',
                actionType: 'close',
              };
              this.dialog.open(ActionModalComponent, {
                maxWidth: '400px',
                maxHeight: '400px',
                width: '100%',
                height: '100%',
                data,
              });
            }
          });
      } else {
        this.financeService
          .createRequest(request)
          .pipe(
            first(),
            catchError(error => {
              this.toastrService.error(
                error.error.message,
                error.error.error || serverError
              );
              return of(null);
            }),
            finalize(() => {
              this.isLoading = false;
            })
          )
          .subscribe(response => {
            if (response) {
              this.dialogRef.close(response);
              const data: ActionModalData = {
                actionIllustration: ActionModalIllustration.success,
                title: 'Congratulations!',
                actionColor: 'primary',
                subtext: 'Well done, You have successfully created a request',
                actionType: 'close',
              };
              this.dialog.open(ActionModalComponent, {
                maxWidth: '400px',
                maxHeight: '400px',
                width: '100%',
                height: '100%',
                data,
              });
            }
          });
      }
    } else {
      this.requestForm.markAllAsTouched();
      this.requestForm.markAsDirty();
    }
  }

  cancel() {
    this.dialogRef.close();
  }
}
