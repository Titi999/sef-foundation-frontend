import { Component } from '@angular/core';
import {
  MatError,
  MatFormField,
  MatFormFieldModule,
} from '@angular/material/form-field';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { passwordValidator } from '@app/utils/functions';
import { MatInput } from '@angular/material/input';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [MatError, ReactiveFormsModule, MatFormFieldModule, MatInput],
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.scss',
})
export class AddUserComponent {
  public userForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.email]),
    email: new FormControl('', [Validators.required, passwordValidator]),
    role: new FormControl(''),
  });

  submit() {}
}
