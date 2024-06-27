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
import { MatDialog } from '@angular/material/dialog';
import { MatError, MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { AuthService } from '@app/auth/auth.service';
import { serverError } from '@app/libs/constants';
import { passwordValidator } from '@app/libs/validators';
import { AvatarModule } from 'ngx-avatars';
import { ToastrService } from 'ngx-toastr';
import { catchError, finalize, of } from 'rxjs';
import { SettingsService } from './settings.service';

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
  public generalInfoloading = false;
  public passwordLoading = false;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private readonly dialog: MatDialog,
    private readonly settingsService: SettingsService,
    private readonly toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.generalInfoForm = this.fb.group({
      id: [{ value: '', disabled: true }, Validators.required],
      name: ['', Validators.required],
      role: [{ value: '', disabled: true }, Validators.required],
      email: [
        { value: '', disabled: true },
        [Validators.required, Validators.email],
      ],
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
      twoFactorAuthentication: [{ value: '', disabled: true }],
    });
    if (this.isPasswordEditMode) {
      this.passwordForm.reset();
    } else {
      this.passwordInfo();
    }
  }

  private generalInfo() {
    this.generalInfoForm.patchValue({
      id: this.authService.loggedInUser()?.user.id,
      name: this.authService.loggedInUser()?.user.name,
      role: this.authService.role(),
      email: this.authService.loggedInUser()?.user.email,
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
    if (this.isPasswordEditMode) {
      this.passwordForm.reset();
    } else {
      this.passwordInfo();
    }
  }

  public cancelGeneralInfoEdit() {
    this.toggleGeneralInfoEditMode();
  }

  public cancelPasswordEdit() {
    this.togglePasswordEditMode();
  }

  private passwordInfo() {
    this.passwordForm.patchValue({
      currentPassword: '********',
      confirmNewPassword: '********',
      newPassword: '********',
      twoFactorAuthentication: 'Yes',
    });
  }

  public submitChangeName() {
    const id = this.authService.loggedInUser()?.user.id;
    const { name } = this.generalInfoForm.value;

    if (id && this.generalInfoForm.valid) {
      this.generalInfoloading = true;
      this.settingsService
        .changeName(id, name)
        .pipe(
          catchError(error => {
            this.toastrService.error(
              error.error.message,
              error.error.error || serverError
            );
            return of(null);
          }),
          finalize(() => (this.generalInfoloading = false))
        )
        .subscribe(response => {
          if (response) {
            this.authService.updateUser(response.data);
            this.toggleGeneralInfoEditMode();
            this.toastrService.success(response?.message);
          }
        });
    }
  }

  public submitChangePassword() {
    const id = this.authService.loggedInUser()?.user.id;
    const { currentPassword, newPassword, confirmNewPassword } =
      this.passwordForm.value;

    if (id && this.generalInfoForm.valid) {
      this.passwordLoading = true;
      this.settingsService
        .changePassword(id, currentPassword, newPassword, confirmNewPassword)
        .pipe(
          catchError(error => {
            this.toastrService.error(
              error.error.message,
              error.error.error || serverError
            );
            return of(null);
          }),
          finalize(() => (this.passwordLoading = false))
        )
        .subscribe(response => {
          if (response) {
            this.toastrService.success(response.message);
            this.authService.logout().subscribe();
          }
        });
    }
  }
}
