import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatError, MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { AuthService } from '@app/auth/auth.service';
import { capitalizeFirstLetter } from '@app/libs/util';
import { passwordValidator } from '@app/libs/validators';
import { AvatarModule } from 'ngx-avatars';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    AvatarModule,
    MatButton,
    MatIconModule,
    MatCardModule,
    MatError,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInput,
    CommonModule,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent implements OnInit {
  public generalInfoForm!: FormGroup;
  public passwordForm!: FormGroup;

  public isGeneralInfoEditMode = false;
  public isPasswordEditMode = false;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.generalInfoForm = this.fb.group({
      name: ['', Validators.required],
      role: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    });

    this.generalInfo();

    this.passwordForm = this.fb.group({
      currentPassword: [
        '',
        [Validators.required, Validators.minLength(8), passwordValidator()],
      ],
      confirmNewPassword: [
        '',
        [Validators.required, Validators.minLength(8), passwordValidator()],
      ],
      newPassword: [
        '',
        [Validators.required, Validators.minLength(8), passwordValidator()],
      ],
      twoFactorAuthentication: [''],
    });

    this.passwordInfo();
  }

  private generalInfo() {
    this.generalInfoForm.patchValue({
      name: this.authService.loggedInUser()?.user.name,
      role: capitalizeFirstLetter(this.authService.role() as string),
      email: this.authService.loggedInUser()?.user.email,
      phone: '0211113334',
    });
  }

  public get userName() {
    return this.authService.userName();
  }

  public toggleGeneralInfoEditMode(): void {
    this.isGeneralInfoEditMode = !this.isGeneralInfoEditMode;
  }

  public togglePasswordEditMode(): void {
    this.isPasswordEditMode = !this.isPasswordEditMode;
  }

  public cancelGeneralInfoEdit() {
    this.toggleGeneralInfoEditMode();
    this.generalInfo();
  }

  public cancelPasswordEdit() {
    this.togglePasswordEditMode();
    this.passwordInfo();
  }

  private passwordInfo() {
    this.passwordForm.patchValue({
      currentPassword: '1234Bnnn@j',
      confirmNewPassword: '88889ghTY!nn',
      newPassword: '88889ghTY!nn',
      twoFactorAuthentication: 'Yes',
    });
  }
}
