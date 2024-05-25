import { Component, Inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogClose,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatError, MatFormFieldModule } from '@angular/material/form-field';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { fullNameValidator } from '@app/libs/validators';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import {
  Student,
  studentFormControls,
} from '@app/dashboard/students/students.interface';
import { StudentsService } from '@app/dashboard/students/students.service';
import { catchError, finalize, first, of } from 'rxjs';
import { serverError } from '@app/libs/constants';
import { ToastrService } from 'ngx-toastr';
import {
  ActionModalData,
  ActionModalIllustration,
} from '@app/shared/action-modal/action-modal.type';
import { ActionModalComponent } from '@app/shared/action-modal/action-modal.component';

@Component({
  selector: 'app-add-student',
  standalone: true,
  imports: [
    MatButton,
    MatDialogClose,
    MatError,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInput,
    MatSelect,
    MatOption,
  ],
  templateUrl: './add-student.component.html',
  styleUrl: './add-student.component.scss',
})
export class AddStudentComponent {
  public title!: string;
  public subtext!: string;
  public isLoading: boolean = false;
  public buttonText!: string;
  public studentForm = new FormGroup({
    name: new FormControl('', [Validators.required, fullNameValidator()]),
    parent: new FormControl('', [Validators.required, fullNameValidator()]),
    school: new FormControl('', [Validators.required]),
    level: new FormControl('', [Validators.required]),
    phone: new FormControl('', [Validators.required]),
    description: new FormControl(''),
  });

  constructor(
    public dialogRef: MatDialogRef<AddStudentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Student,
    private readonly studentService: StudentsService,
    private readonly toastrService: ToastrService,
    private readonly dialog: MatDialog
  ) {
    if (data) {
      this.title = 'Edit student details';
      this.subtext = 'kindly fill in the details to update the beneficiary';
      this.buttonText = 'Update';
      this.studentForm.patchValue(data);
    } else {
      this.title = 'Add a new student';
      this.subtext = 'kindly fill in the details to create a new beneficiary';
      this.buttonText = 'Create';
    }
  }

  submit() {
    if (this.studentForm.valid) {
      this.isLoading = true;
      this.dialogRef.disableClose = true;
      const studentData = this.studentForm.value as Student;
      if (!this.data) {
        this.studentService
          .addStudent(studentData)
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
                subtext: 'Great, student has been successfully edited',
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
        const student = this.studentForm.value as Omit<Student, 'id'>;
        this.studentService
          .editStudent(id, student)
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
                subtext: 'Great, student has been successfully edited',
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
      this.studentForm.markAsDirty();
      this.studentForm.markAllAsTouched();
    }
  }

  getFormErrors(controlName: studentFormControls) {
    const control = this.studentForm.get(controlName);
    if (control?.errors?.['required']) {
      return 'This field is required';
    }
    switch (controlName) {
      case 'parent':
        if (control?.errors?.['invalidFullName']) {
          return 'Please provide a valid full name';
        }
        break;
      case 'name':
        if (control?.errors?.['invalidFullName']) {
          return 'Please provide a valid full name';
        }
        break;
      default:
        return '';
    }
    return '';
  }
}
