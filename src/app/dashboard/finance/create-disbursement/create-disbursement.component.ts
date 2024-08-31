import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { InfoCardComponent } from '@app/shared/info-card/info-card.component';
import { MatButton, MatIconButton } from '@angular/material/button';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerToggle,
} from '@angular/material/datepicker';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogClose,
  MatDialogRef,
} from '@angular/material/dialog';
import {
  MatError,
  MatFormField,
  MatLabel,
  MatPrefix,
  MatSuffix,
} from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import {
  MatAutocomplete,
  MatAutocompleteTrigger,
  MatOption,
} from '@angular/material/autocomplete';
import { MatSelect } from '@angular/material/select';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AsyncPipe, NgForOf } from '@angular/common';
import { provideNativeDateAdapter } from '@angular/material/core';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import {
  catchError,
  finalize,
  first,
  map,
  Observable,
  of,
  ReplaySubject,
  startWith,
  Subject,
  takeUntil,
} from 'rxjs';
import { Student } from '@app/dashboard/students/students.interface';
import { StudentsService } from '@app/dashboard/students/students.service';
import {
  budgetPeriods,
  otherDistributionTitles,
  serverError,
} from '@app/libs/constants';
import { ToastrService } from 'ngx-toastr';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { BannerComponent } from '@app/shared/banner/banner.component';
import {
  CreateDisbursement,
  Disbursement,
} from '@app/dashboard/finance/disbursement/disbursement.interface';
import { FinanceService } from '@app/dashboard/finance/finance.service';
import {
  ActionModalData,
  ActionModalIllustration,
} from '@app/shared/action-modal/action-modal.type';
import { ActionModalComponent } from '@app/shared/action-modal/action-modal.component';
import { Router } from '@angular/router';
import { SpinnerComponent } from '@app/shared/spinner/spinner.component';
import { MatChip } from '@angular/material/chips';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { toSignal } from '@angular/core/rxjs-interop';
import { getYearsDropDownValues } from '@app/libs/util';

@Component({
  selector: 'app-create-disbursement',
  standalone: true,
  imports: [
    InfoCardComponent,
    MatButton,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatDialogClose,
    MatError,
    MatFormField,
    MatIcon,
    MatIconButton,
    MatInput,
    MatLabel,
    MatOption,
    MatPrefix,
    MatSelect,
    MatSuffix,
    ReactiveFormsModule,
    NgxMatSelectSearchModule,
    AsyncPipe,
    NgForOf,
    MatProgressSpinner,
    BannerComponent,
    SpinnerComponent,
    MatChip,
    MatSlideToggle,
    MatAutocomplete,
    MatAutocompleteTrigger,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './create-disbursement.component.html',
  styleUrl: './create-disbursement.component.scss',
})
export class CreateDisbursementComponent implements OnInit, OnDestroy {
  disbursementForm = this.fb.group({
    studentId: ['', Validators.required],
    title: [''],
    amount: ['', Validators.required],
    period: ['', Validators.required],
    year: ['', Validators.required],
  });
  isLoading = false;
  public studentsFilterCtrl = new FormControl<string>('');
  public filteredStudents: ReplaySubject<Student[]> = new ReplaySubject<
    Student[]
  >(1);
  @ViewChild('singleSelect', { static: true }) singleSelect!: MatSelect;
  protected _onDestroy = new Subject<void>();
  public isLoadingStudents = true;
  protected students: Student[] = [];
  filteredOptions: Observable<string[]> =
    this.disbursementForm.controls.title.valueChanges.pipe(
      takeUntil(this._onDestroy),
      startWith(''),
      map(value => this._filter(value || ''))
    );
  public isLoadingDisbursement = false;
  options = otherDistributionTitles;
  public showToggle = true;
  public others = new FormControl<boolean>(false);
  isFormInValid = toSignal(
    this.disbursementForm.statusChanges.pipe(
      map(() => this.disbursementForm.invalid)
    )
  );

  constructor(
    private readonly fb: FormBuilder,
    private readonly studentsService: StudentsService,
    private toastrService: ToastrService,
    private readonly financeService: FinanceService,
    private readonly dialog: MatDialog,
    private readonly router: Router,
    private cdr: ChangeDetectorRef,
    public dialogRef: MatDialogRef<CreateDisbursementComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: Disbursement
  ) {
    if (data) {
      this.showToggle = false;
      const { amount, title, __student__, period, year } = data;
      if (title) {
        this.others.setValue(true);
        this.disbursementForm.controls.studentId.removeValidators(
          Validators.required
        );
        this.disbursementForm.controls.studentId.setValue('');
        this.disbursementForm.controls.title.setValidators(Validators.required);
      }
      this.disbursementForm.patchValue({
        amount: String(amount),
        title: title ?? '',
        studentId: __student__ ? __student__.id : '',
        period,
        year: String(year),
      });
    }
  }

  ngOnInit() {
    this.studentsService
      .getAllStudents()
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
          this.students = response.data;
          this.filteredStudents.next(response.data.slice());
        }
      });

    this.studentsFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterStudents();
      });

    this.others.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(value => {
        if (value) {
          this.disbursementForm.controls.studentId.removeValidators(
            Validators.required
          );
          this.disbursementForm.controls.studentId.setValue('');
          this.disbursementForm.controls.title.setValidators(
            Validators.required
          );
        } else {
          this.disbursementForm.controls.studentId.markAsUntouched();
          this.disbursementForm.controls.title.setValue('');
          this.disbursementForm.controls.studentId.setValidators(
            Validators.required
          );
          this.disbursementForm.controls.title.removeValidators(
            Validators.required
          );
        }
        this.disbursementForm.controls.title.updateValueAndValidity();
        this.disbursementForm.controls.studentId.updateValueAndValidity();
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.options.filter(option =>
      option.toLowerCase().includes(filterValue)
    );
  }

  protected filterStudents() {
    if (!this.students) {
      return;
    }
    let search = this.studentsFilterCtrl.value as string;
    if (!search) {
      this.filteredStudents.next(this.students.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.filteredStudents.next(
      this.students.filter(
        student => student.name.toLowerCase().indexOf(search) > -1
      )
    );
  }

  submit() {
    if (this.disbursementForm.valid) {
      const disbursementDetails: CreateDisbursement = {
        amount: Number(this.disbursementForm.value.amount as string),
        studentId: this.disbursementForm.value.studentId as string,
        period: this.disbursementForm.value.period as string,
        title: this.disbursementForm.value.title || '',
        year: Number(this.disbursementForm.value.year),
      };
      this.isLoading = true;
      this.dialogRef.disableClose = true;
      if (this.data) {
        this.financeService
          .editDisbursement(this.data.id, disbursementDetails)
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
              this.dialogRef.disableClose = false;
            })
          )
          .subscribe(response => {
            if (response) {
              this.dialogRef.close(response.data);
              const data: ActionModalData = {
                actionIllustration: ActionModalIllustration.success,
                title: 'Congratulations!',
                actionColor: 'primary',
                subtext:
                  'Well done, You have successfully edited a disbursement',
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
          .createDisbursement(disbursementDetails)
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
              this.dialogRef.disableClose = false;
            })
          )
          .subscribe(response => {
            if (response) {
              this.dialogRef.close(response.data);
              const data: ActionModalData = {
                actionIllustration: ActionModalIllustration.success,
                title: 'Congratulations!',
                actionColor: 'primary',
                subtext:
                  'Well done, You have successfully created a disbursement',
                actionType: 'close',
              };
              this.dialog.open(ActionModalComponent, {
                maxWidth: '400px',
                maxHeight: '400px',
                width: '100%',
                height: '100%',
                data,
              });
              void this.router.navigate(['dashboard/finance/disbursements']);
            }
          });
      }
    } else {
      this.disbursementForm.markAllAsTouched();
      this.disbursementForm.markAsDirty();
    }
  }

  cancel() {
    this.dialogRef.close();
  }

  protected readonly budgetPeriods = budgetPeriods;
  protected readonly getYearsDropDownValues = getYearsDropDownValues;
}
