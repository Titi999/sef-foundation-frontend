import { Component, Inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogClose,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatError, MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { budgetPeriods, serverError } from '@app/libs/constants';
import {
  CreateFund,
  Fund,
} from '@app/dashboard/finance/budget-allocation/budget-allocation.interface';
import { FinanceService } from '@app/dashboard/finance/finance.service';
import { catchError, finalize, first, of } from 'rxjs';
import {
  ActionModalData,
  ActionModalIllustration,
} from '@app/shared/action-modal/action-modal.type';
import { ActionModalComponent } from '@app/shared/action-modal/action-modal.component';
import { ToastrService } from 'ngx-toastr';
import { getYearsDropDownValues } from '@app/libs/util';

@Component({
  selector: 'app-add-funds',
  standalone: true,
  imports: [
    AsyncPipe,
    FormsModule,
    MatButton,
    MatCheckbox,
    MatDialogClose,
    MatError,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInput,
    MatSelect,
    MatOption,
  ],
  templateUrl: './add-funds.component.html',
  styleUrl: './add-funds.component.scss',
})
export class AddFundsComponent {
  public title!: string;
  public subtext!: string;
  public isLoading: boolean = false;
  public buttonText!: string;
  protected readonly budgetPeriods = budgetPeriods;
  public fundForm = this.fb.group({
    period: ['', Validators.required],
    title: ['', Validators.required],
    amount: ['', Validators.required],
    year: ['', Validators.required],
    comments: [''],
  });

  constructor(
    private readonly fb: FormBuilder,
    public dialogRef: MatDialogRef<AddFundsComponent>,
    private readonly financeService: FinanceService,
    private readonly toastrService: ToastrService,
    private readonly dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: Fund
  ) {
    if (data) {
      this.title = 'Edit fund details';
      this.subtext = 'kindly fill in the details to update the fund';
      this.buttonText = 'Update';
      const { year, comments, title, amount, period } = this.data;
      this.fundForm.patchValue({
        year: year.toString(),
        comments,
        title,
        amount: amount.toString(),
        period,
      });
    } else {
      this.title = 'Add a new fund';
      this.subtext = 'kindly fill in the details to create a new fund';
      this.buttonText = 'Create';
    }
  }

  submit() {
    if (this.fundForm.valid) {
      this.isLoading = true;
      this.dialogRef.disableClose = true;
      const fundData: CreateFund = {
        period: this.fundForm.controls.period.value as string,
        year: Number(this.fundForm.controls.year.value),
        amount: Number(this.fundForm.controls.amount.value),
        title: this.fundForm.controls.title.value as string,
        comments: this.fundForm.controls.comments.value ?? '',
      };
      if (!this.data) {
        this.financeService
          .createFund(fundData)
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
                title: 'Awesome!',
                actionColor: 'primary',
                subtext: 'Great, Fund has been successfully added',
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
          .editFund(this.data.id, fundData)
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
                title: 'Awesome!',
                actionColor: 'primary',
                subtext: 'Great, Fund has been successfully updated',
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
    }
  }

  getFormErrors(
    controlName: 'period' | 'title' | 'amount' | 'year' | 'comments'
  ) {
    const control = this.fundForm.get(controlName);
    if (control?.errors?.['required']) {
      return 'This field is required';
    }
    return '';
  }

  protected readonly getYearsDropDownValues = getYearsDropDownValues;
}
