import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { InfoCardComponent } from '@app/shared/info-card/info-card.component';
import { MatButton, MatIconButton } from '@angular/material/button';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerToggle,
} from '@angular/material/datepicker';
import { MatDialog, MatDialogClose } from '@angular/material/dialog';
import {
  MatError,
  MatFormField,
  MatLabel,
  MatPrefix,
  MatSuffix,
} from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatOption } from '@angular/material/autocomplete';
import { MatSelect } from '@angular/material/select';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AsyncPipe, Location, NgForOf } from '@angular/common';
import { provideNativeDateAdapter } from '@angular/material/core';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import {
  catchError,
  finalize,
  first,
  of,
  ReplaySubject,
  Subject,
  takeUntil,
} from 'rxjs';
import { Student } from '@app/dashboard/students/students.interface';
import { StudentsService } from '@app/dashboard/students/students.service';
import { serverError } from '@app/libs/constants';
import { ToastrService } from 'ngx-toastr';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { BannerComponent } from '@app/shared/banner/banner.component';
import {
  CreateDisbursement,
  CreateDisbursementDistribution,
} from '@app/dashboard/finance/disbursement/disbursement.interface';
import { FinanceService } from '@app/dashboard/finance/finance.service';
import {
  ActionModalData,
  ActionModalIllustration,
} from '@app/shared/action-modal/action-modal.type';
import { ActionModalComponent } from '@app/shared/action-modal/action-modal.component';
import { Router } from '@angular/router';

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
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './create-disbursement.component.html',
  styleUrl: './create-disbursement.component.scss',
})
export class CreateDisbursementComponent implements OnInit, OnDestroy {
  disbursementForm = this.fb.group({
    studentId: ['', Validators.required],
    amount: ['', Validators.required],
    disbursementDistribution: this.fb.array([]),
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
  public distributionForm = this.fb.group({
    title: ['', Validators.required],
    amount: ['', Validators.required],
  });
  public totalDistribution = 0;
  public showBanner = false;
  public bannerText = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly location: Location,
    private readonly studentsService: StudentsService,
    private toastrService: ToastrService,
    private readonly financeService: FinanceService,
    private readonly dialog: MatDialog,
    private readonly router: Router
  ) {}

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

  get disbursementDistributions(): FormArray {
    return this.disbursementForm.controls.disbursementDistribution as FormArray;
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

  addDistribution() {
    if (this.disbursementForm.controls.amount.valid) {
      const amount = this.distributionForm.controls.amount.value;
      const values = new FormGroup({
        title: new FormControl(this.distributionForm.controls.title.value),
        amount: new FormControl(amount),
      });
      this.totalDistribution += parseInt(amount as string);
      const totalBudget = parseInt(
        this.disbursementForm.controls.amount.value || '0'
      );
      if (this.totalDistribution > totalBudget) {
        this.bannerText =
          'You disbursement distribution as exceeded your total budget.';
        this.showBanner = true;
        return;
      }
      this.disbursementDistributions.push(values);
      this.distributionForm.reset();
    } else {
      this.bannerText = 'Please enter disbursement amount before distribution';
      this.showBanner = true;
    }
  }

  submit() {
    if (this.disbursementDistributions.length) {
      const disbursementDetails: CreateDisbursement = {
        amount: parseInt(this.disbursementForm.value.amount as string),
        studentId: this.disbursementForm.value.studentId as string,
        disbursementDistribution: this.disbursementForm.controls
          .disbursementDistribution.value as CreateDisbursementDistribution[],
      };
      this.isLoading = true;
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
          })
        )
        .subscribe(response => {
          if (response) {
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
    } else {
      this.bannerText =
        'Please make sure your distribution equals disbursement amount';
      this.showBanner = true;
    }
  }

  cancel() {
    this.location.back();
  }

  closeBanner() {
    this.showBanner = false;
  }

  deleteDistribution(index: number) {
    this.totalDistribution -= parseInt(
      this.disbursementDistributions.at(index).value
    );
    this.disbursementDistributions.removeAt(index);
  }
}
