import { Component, Inject } from '@angular/core';
import { AsyncPipe, NgForOf } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogClose,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatOption } from '@angular/material/autocomplete';
import { MatSelect } from '@angular/material/select';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { catchError, finalize, first, of, Subject } from 'rxjs';
import { serverError, termList } from '@app/libs/constants';
import {
  ActionModalData,
  ActionModalIllustration,
} from '@app/shared/action-modal/action-modal.type';
import { ActionModalComponent } from '@app/shared/action-modal/action-modal.component';
import { PerformanceService } from '@app/dashboard/performance/performance.service';
import {
  BeneficiaryAcademicPerformance,
  CreateAcademics,
  performanceFormControls,
} from '@app/dashboard/performance/performance.interface';
import { ToastrService } from 'ngx-toastr';
import { getYearsDropDownValues } from '@app/libs/util';

@Component({
  selector: 'app-add-performance',
  standalone: true,
  imports: [
    AsyncPipe,
    MatButton,
    MatCheckbox,
    MatDialogClose,
    MatError,
    MatFormField,
    MatInput,
    MatLabel,
    MatOption,
    MatSelect,
    NgForOf,
    NgxMatSelectSearchModule,
    ReactiveFormsModule,
  ],
  templateUrl: './add-performance.component.html',
  styleUrl: './add-performance.component.scss',
})
export class AddPerformanceComponent {
  public title!: string;
  public subtext!: string;
  public isLoading: boolean = false;
  public buttonText!: string;
  protected _onDestroy = new Subject<void>();
  public addPerformanceForm = new FormGroup({
    course: new FormControl('', [Validators.required]),
    score: new FormControl('', [Validators.required]),
    term: new FormControl('', [Validators.required]),
    year: new FormControl('', [Validators.required]),
    remarks: new FormControl(''),
  });

  constructor(
    public dialogRef: MatDialogRef<AddPerformanceComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BeneficiaryAcademicPerformance,
    private readonly performanceService: PerformanceService,
    private readonly toastrService: ToastrService,
    private readonly dialog: MatDialog
  ) {
    console.log(data);
    if (data) {
      this.title = 'Edit performance details';
      this.subtext = 'kindly fill in the details to update the performance';
      this.buttonText = 'Update';
      this.addPerformanceForm.patchValue({
        ...data,
        year: data.year.toString(),
      });
    } else {
      this.title = 'Add a new record';
      this.subtext =
        'kindly fill in the details to create a new academic performance';
      this.buttonText = 'Create';
    }
  }

  submit() {
    if (this.addPerformanceForm.valid) {
      this.isLoading = true;
      this.dialogRef.disableClose = true;
      const academicData = this.addPerformanceForm.value as CreateAcademics;
      if (!this.data) {
        this.performanceService
          .addBeneficiaryAcademicPerformance(academicData)
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
                subtext:
                  'Great, A new performance record has been successfully added',
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
        this.performanceService
          .editBeneficiaryAcademicPerformance(this.data.id, academicData)
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
                subtext: 'Great, academic record has been successfully edited',
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
      this.addPerformanceForm.markAsDirty();
      this.addPerformanceForm.markAllAsTouched();
    }
  }

  getFormErrors(controlName: performanceFormControls) {
    const control = this.addPerformanceForm.get(controlName);
    if (control?.errors?.['required']) {
      return 'This field is required';
    }
    switch (controlName) {
      default:
        return '';
    }
  }

  protected readonly termList = termList.slice(1);
  protected readonly getYearsDropDownValues = getYearsDropDownValues;
}
