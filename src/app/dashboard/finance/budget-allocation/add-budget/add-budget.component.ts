import { Component, Inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import {
  FormControl,
  FormGroup,
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
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { budgetPeriods, serverError } from '@app/libs/constants';
import {
  BudgetAllocation,
  CreateBudget,
} from '@app/dashboard/finance/budget-allocation/budget-allocation.interface';
import { FinanceService } from '@app/dashboard/finance/finance.service';
import { catchError, finalize, first, of } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import {
  ActionModalData,
  ActionModalIllustration,
} from '@app/shared/action-modal/action-modal.type';
import { ActionModalComponent } from '@app/shared/action-modal/action-modal.component';
import { getYearsDropDownValues } from '@app/libs/util';

@Component({
  selector: 'app-add-budget',
  standalone: true,
  imports: [
    AsyncPipe,
    FormsModule,
    MatButton,
    MatCheckbox,
    MatDialogClose,
    MatError,
    ReactiveFormsModule,
    MatFormField,
    MatSelect,
    MatOption,
    MatLabel,
  ],
  templateUrl: './add-budget.component.html',
  styleUrl: './add-budget.component.scss',
})
export class AddBudgetComponent {
  public title!: string;
  public subtext!: string;
  public budgetForm = new FormGroup({
    period: new FormControl('', [Validators.required]),
    year: new FormControl('', [Validators.required]),
  });
  protected readonly budgetPeriods = budgetPeriods;
  public isLoading: boolean = false;
  public buttonText!: string;

  constructor(
    public dialogRef: MatDialogRef<AddBudgetComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BudgetAllocation,
    private readonly financeService: FinanceService,
    private readonly toastrService: ToastrService,
    private readonly dialog: MatDialog
  ) {
    if (data) {
      this.title = 'Edit budget';
      this.subtext = 'kindly fill in the details to update the budget';
      this.buttonText = 'Update';
      this.budgetForm.controls.period.setValue(data.period);
    } else {
      this.title = 'Add a new budget';
      this.subtext = 'kindly fill in the details to create a new budget';
      this.buttonText = 'Create';
    }
  }

  submit() {
    if (this.budgetForm.valid) {
      this.isLoading = true;
      this.dialogRef.disableClose = true;
      const budgetData: CreateBudget = {
        period: this.budgetForm.controls.period.value as string,
        year: Number(this.budgetForm.controls.year.value),
      };
      if (!this.data) {
        this.financeService
          .createBudget(budgetData)
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
      } else {
        const { id } = this.data;
        const budget: CreateBudget = {
          period: this.budgetForm.controls.period.value as string,
          year: Number(this.budgetForm.controls.year.value),
        };
        this.financeService
          .editBudget(id, budget)
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
                subtext: 'Great, budget has been successfully edited',
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

  getFormErrors(controlName: 'period' | 'year') {
    const control = this.budgetForm.get(controlName);
    if (control?.errors?.['required']) {
      return 'This field is required';
    }
    return '';
  }

  protected readonly getYearsDropDownValues = getYearsDropDownValues;
}
