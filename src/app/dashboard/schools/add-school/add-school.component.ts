import { Component, Inject } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
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
import { fullNameValidator } from '@app/libs/validators';
import { ToastrService } from 'ngx-toastr';

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
    name: new FormControl('', [Validators.required, fullNameValidator()]),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\d{10}$/),
    ]),
    location: new FormControl('', [Validators.required]),
  });

  constructor(
    private readonly toastrService: ToastrService,
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

  submit() {}

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
