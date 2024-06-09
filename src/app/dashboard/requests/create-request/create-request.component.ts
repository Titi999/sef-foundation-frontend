import { Component, OnDestroy, OnInit } from '@angular/core';
import { SpinnerComponent } from '@app/shared/spinner/spinner.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { InfoCardComponent } from '@app/shared/info-card/info-card.component';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MatFormField,
  MatPrefix,
  MatSuffix,
} from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatInput, MatLabel } from '@angular/material/input';
import { BannerComponent } from '@app/shared/banner/banner.component';
import { catchError, finalize, first, of, Subject, tap } from 'rxjs';
import { AsyncPipe, Location } from '@angular/common';
import { MatDialog, MatDialogClose } from '@angular/material/dialog';
import {
  CreateDisbursement,
  CreateDisbursementDistribution,
} from '@app/dashboard/finance/disbursement/disbursement.interface';
import { serverError } from '@app/libs/constants';
import {
  ActionModalData,
  ActionModalIllustration,
} from '@app/shared/action-modal/action-modal.type';
import { ActionModalComponent } from '@app/shared/action-modal/action-modal.component';
import { FinanceService } from '@app/dashboard/finance/finance.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { StudentsService } from '@app/dashboard/students/students.service';
import { map } from 'rxjs/operators';

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
  ],
  templateUrl: './create-request.component.html',
  styleUrl: './create-request.component.scss',
})
export class CreateRequestComponent implements OnDestroy, OnInit {
  isLoading = false;
  isChecking = false;
  beneficiaryExists = false;
  showBanner = false;
  bannerText = '';
  requestForm = this.fb.group({
    amount: ['', Validators.required],
    disbursementDistribution: this.fb.array([]),
  });
  public distributionForm = this.fb.group({
    title: ['', Validators.required],
    amount: ['', Validators.required],
  });
  protected _onDestroy = new Subject<void>();
  public totalDistribution = 0;

  constructor(
    private readonly fb: FormBuilder,
    private readonly location: Location,
    private readonly financeService: FinanceService,
    private readonly toastrService: ToastrService,
    private readonly dialog: MatDialog,
    private readonly router: Router,
    private readonly studentsService: StudentsService
  ) {}

  ngOnInit() {
    this.beneficiaryInfoExists();
  }

  beneficiaryInfoExists() {
    this.isChecking = true;
    return this.studentsService
      .beneficiaryInfoExists()
      .pipe(
        first(),
        finalize(() => (this.isChecking = false)),
        tap(response => (this.beneficiaryExists = response.data))
      )
      .subscribe();
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  get disbursementDistributions(): FormArray {
    return this.requestForm.controls.disbursementDistribution as FormArray;
  }

  addDistribution() {
    if (this.requestForm.controls.amount.valid) {
      const amount = this.distributionForm.controls.amount.value;
      const values = new FormGroup({
        title: new FormControl(this.distributionForm.controls.title.value),
        amount: new FormControl(amount),
      });
      this.totalDistribution += parseInt(amount as string);
      const totalBudget = parseInt(
        this.requestForm.controls.amount.value || '0'
      );
      if (this.totalDistribution > totalBudget) {
        this.bannerText =
          'Your disbursement distribution as exceeded your total budget.';
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

  deleteDistribution(index: number) {
    this.totalDistribution -= parseInt(
      this.disbursementDistributions.at(index).value
    );
    this.disbursementDistributions.removeAt(index);
  }

  closeBanner() {
    this.showBanner = !this.showBanner;
  }

  cancel() {
    this.location.back();
  }

  submit() {
    if (this.disbursementDistributions.length) {
      const disbursementDetails: Omit<CreateDisbursement, 'studentId'> = {
        amount: parseInt(this.requestForm.value.amount as string),
        disbursementDistribution: this.requestForm.controls
          .disbursementDistribution.value as CreateDisbursementDistribution[],
      };
      this.isLoading = true;
      this.financeService
        .createBeneficiaryDisbursement(disbursementDetails)
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
            void this.router.navigate(['dashboard/requests']);
          }
        });
    } else {
      this.bannerText =
        'Please make sure your distribution equals disbursement amount';
      this.showBanner = true;
    }
  }
}
