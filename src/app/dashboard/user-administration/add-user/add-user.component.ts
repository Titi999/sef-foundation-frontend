import { Component } from '@angular/core';
import { MatError, MatFormFieldModule } from '@angular/material/form-field';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { fullNameValidator, passwordValidator } from '@app/libs/validators';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [
    MatError,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInput,
    MatSelect,
    MatOption,
    MatButton,
  ],
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.scss',
})
export class AddUserComponent {
  isLoading: boolean = false;
  public userForm = new FormGroup({
    name: new FormControl('', [Validators.required, fullNameValidator()]),
    email: new FormControl('', [Validators.required, Validators.email]),
    role: new FormControl('', [Validators.required]),
  });

  roles = [
    { name: 'Super Admin', value: 'super admin' },
    { name: 'Admin', value: 'admin' },
    { name: 'Beneficiary', value: 'beneficiary' },
  ];

  submit() {}

  getFormErrors(controlName: 'name' | 'email' | 'role') {
    const control = this.userForm.get(controlName);
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
      default:
        return '';
    }
    return '';
  }
}
