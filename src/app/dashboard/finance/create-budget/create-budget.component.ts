import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import {
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardTitle,
} from '@angular/material/card';
import { InfoCardComponent } from '@app/shared/info-card/info-card.component';
import { CommonModule } from '@angular/common';
import {
  MatError,
  MatFormField,
  MatFormFieldModule,
  MatLabel,
} from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatOption, provideNativeDateAdapter } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { otherDistributionTitles, serverError } from '@app/libs/constants';
import { MatList, MatListItem } from '@angular/material/list';
import { MatIcon } from '@angular/material/icon';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogClose,
  MatDialogRef,
} from '@angular/material/dialog';
import {
  CreateBudgetDistribution,
  CreateOtherBudgetDistribution,
} from '@app/dashboard/finance/budget-allocation/budget-allocation.interface';
import { FinanceService } from '@app/dashboard/finance/finance.service';
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
import { ToastrService } from 'ngx-toastr';
import {
  ActionModalData,
  ActionModalIllustration,
} from '@app/shared/action-modal/action-modal.type';
import { ActionModalComponent } from '@app/shared/action-modal/action-modal.component';
import { BannerComponent } from '@app/shared/banner/banner.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { SpinnerComponent } from '@app/shared/spinner/spinner.component';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatChip } from '@angular/material/chips';
import { Papa } from 'ngx-papaparse';
import { StudentsService } from '@app/dashboard/students/students.service';
import { Student } from '@app/dashboard/students/students.interface';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatTableModule,
} from '@angular/material/table';
import { ZeroPadPipe } from '@app/pipes/zero-pad.pipe';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import {
  MatAutocomplete,
  MatAutocompleteTrigger,
} from '@angular/material/autocomplete';

interface DistributionFormValue {
  studentCode: string;
  school: string;
  class: string;
  tuition: string;
  textBooks: string;
  extraClasses: string;
  examFee: string;
  uniformBag: string;
  excursion: string;
  transportation: string;
  wears: string;
  schoolFeeding: string;
  stationery: string;
  provision: string;
  homeCare: string;
}

@Component({
  selector: 'app-create-budget',
  standalone: true,
  imports: [
    FormsModule,
    MatButton,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    InfoCardComponent,
    CommonModule,
    MatError,
    MatFormField,
    MatLabel,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatSelect,
    MatOption,
    MatList,
    MatListItem,
    MatIcon,
    MatIconButton,
    MatDialogClose,
    BannerComponent,
    MatProgressSpinner,
    SpinnerComponent,
    MatCheckbox,
    MatChip,
    NgxMatSelectSearchModule,
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatTableModule,
    ZeroPadPipe,
    MatSlideToggle,
    MatAutocomplete,
    MatAutocompleteTrigger,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './create-budget.component.html',
  styleUrl: './create-budget.component.scss',
})
export class CreateBudgetComponent implements OnInit, OnDestroy {
  isLoading: boolean = false;
  distributionForm = this.fb.group({
    studentCode: ['', Validators.required],
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
  othersDistributionForm = this.fb.group({
    title: ['', Validators.required],
    amount: ['', Validators.required],
    comment: [''],
  });
  displayedColumns: string[] = [
    'student',
    'school',
    'class',
    'tuition',
    'textBooks',
    'extraClasses',
    'examFee',
    'homeCare',
    'uniformBag',
    'excursion',
    'transportation',
    'stationery',
    'wear',
    'schoolFeeding',
    'provisions',
    'total',
  ];
  isLoadingBudget = false;
  public isLoadingStudents = true;
  protected students: Student[] = [];
  public studentsFilterCtrl = new FormControl<string>('');
  public filteredStudents: ReplaySubject<Student[]> = new ReplaySubject<
    Student[]
  >(1);
  protected _onDestroy = new Subject<void>();
  public budgetDistribution: CreateBudgetDistribution[] | undefined = undefined;
  public others = new FormControl('');
  options = otherDistributionTitles;
  filteredOptions: Observable<string[]> =
    this.othersDistributionForm.controls.title.valueChanges.pipe(
      takeUntil(this._onDestroy),
      startWith(''),
      map(value => this._filter(value || ''))
    );

  constructor(
    private readonly fb: FormBuilder,
    private readonly financeService: FinanceService,
    private readonly toastrService: ToastrService,
    private readonly dialog: MatDialog,
    private readonly papa: Papa,
    private readonly studentsService: StudentsService,
    private dialogRef: MatDialogRef<CreateBudgetComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { id: string; budgetDistribution: CreateBudgetDistribution[] }
  ) {
    if (data.budgetDistribution) {
      this.budgetDistribution = data.budgetDistribution;
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
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  public updateTotal() {
    const form = this.distributionForm.value as DistributionFormValue;
    const fieldsToSum: (keyof DistributionFormValue)[] = [
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
      const value = parseFloat(form[field] || '0');
      return total + (isNaN(value) ? 0 : value);
    }, 0);
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
    let budgetDetails:
      | CreateBudgetDistribution[]
      | CreateOtherBudgetDistribution;
    let response: Observable<unknown>;
    if (this.budgetDistribution && this.budgetDistribution.length) {
      budgetDetails = [...this.budgetDistribution];
      response = this.financeService.createBudgetDistribution(
        budgetDetails,
        this.data.id
      );
    } else if (!this.others.value && this.distributionForm.valid) {
      budgetDetails = [
        {
          ...(this.distributionForm.value as CreateBudgetDistribution),
        },
      ];
      response = this.financeService.createBudgetDistribution(
        budgetDetails,
        this.data.id
      );
    } else if (this.others.value && this.othersDistributionForm.valid) {
      budgetDetails = this.othersDistributionForm
        .value as CreateOtherBudgetDistribution;
      response = this.financeService.createOtherBudgetDistribution(
        budgetDetails,
        this.data.id
      );
    } else {
      this.distributionForm.markAsDirty();
      this.distributionForm.markAllAsTouched();
      this.othersDistributionForm.markAsDirty();
      this.othersDistributionForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    response
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
            subtext: 'Well done, You have successfully created a budget',
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

  cancel() {
    this.dialogRef.close();
  }

  bulkUpload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    this.papa.parse(file as Blob, {
      complete: ({ data }) => {
        const distribution = [];
        for (let i = 1; i < data.length; i++) {
          if (data[i][0] && data[i][1]) {
            distribution.push({
              title: data[i][0],
              amount: data[i][1],
              comments: data[i][2],
            });
          }
        }
      },
    });
  }
}
