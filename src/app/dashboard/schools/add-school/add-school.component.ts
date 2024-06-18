import { Component, Inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogClose,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatError, MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
// import { fullNameValidator } from '@app/libs/validators';
import { serverError } from '@app/libs/constants';
import { ActionModalComponent } from '@app/shared/action-modal/action-modal.component';
import {
  ActionModalData,
  ActionModalIllustration,
} from '@app/shared/action-modal/action-modal.type';
import { ToastrService } from 'ngx-toastr';
import { Subject, catchError, finalize, first, of } from 'rxjs';
import { School, SchoolService } from '../school.service';

interface AddSchool {
  name: string;
  email: string;
  phone: string;
  location: string;
}

@Component({
  selector: 'app-add-school',
  standalone: true,
  imports: [
    MatError,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInput,
    MatSelect,
    MatOption,
    MatButton,
    MatDialogClose,
  ],
  templateUrl: './add-school.component.html',
  styleUrl: './add-school.component.scss',
})
export class AddSchoolComponent {
  public title!: string;
  public subtext!: string;
  public isLoading: boolean = false;
  public buttonText!: string;
  public schoolForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\d{10}$/),
    ]),
    location: new FormControl('', [Validators.required]),
  });
  public schoolFilterCtrl = new FormControl<string>('');
  protected _onDestroy = new Subject<void>();
  protected schools: School[] = [];

  constructor(
    private readonly toastrService: ToastrService,
    private readonly schoolService: SchoolService,
    private readonly dialog: MatDialog,
    public dialogRef: MatDialogRef<AddSchoolComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddSchool & { id: string }
  ) {
    if (data) {
      this.title = 'Edit school details';
      this.subtext = 'kindly fill in the details to update the school';
      this.buttonText = 'Update';
      this.schoolForm.patchValue(data);
    } else {
      this.title = 'Add a new school';
      this.subtext = 'kindly fill in the details to add a new school';
      this.buttonText = 'Add school';
    }
  }

  submit() {
    const { name, email, phone, location } = this.schoolForm.value as School;
    if (this.schoolForm.valid) {
      this.isLoading = true;
      if (!this.data) {
        this.schoolService
          .addSchool(name, email, phone, location)
          .pipe(
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
                subtext: `Great, ${name} has been successfully added`,
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
        const school = this.schoolForm.value as unknown as Omit<School, 'id'>;
        this.schoolService
          .updateSchool(id, name, email, phone, location)
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
                subtext: `Great, ${school.name} school has been successfully updated`,
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
      this.schoolForm.markAsDirty();
      this.schoolForm.markAllAsTouched();
    }
  }

  getFormErrors(controlName: 'name' | 'email' | 'phone' | 'location') {
    const control = this.schoolForm.get(controlName);
    if (control?.errors?.['required']) {
      return 'This field is required';
    }
    switch (controlName) {
      case 'email':
        if (control?.errors?.['email']) {
          return 'Please provide a valid email address';
        }
        break;
      case 'name':
        if (control?.errors?.['invalidFullName']) {
          return 'Please provide a valid full name';
        }
        break;
      case 'phone':
        if (control?.errors?.['pattern']) {
          return 'Please enter a 10-digit phone number';
        }
        break;
      default:
        return '';
    }
    return '';
  }
}
