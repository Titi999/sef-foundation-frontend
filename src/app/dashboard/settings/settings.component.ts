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
import { passwordValidator } from '@app/libs/validators';
import { ActionModalComponent } from '@app/shared/action-modal/action-modal.component';
import {
  ActionModalData,
  ActionModalIllustration,
} from '@app/shared/action-modal/action-modal.type';
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
    private fb: FormBuilder,
    private readonly dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.generalInfoForm = this.fb.group({
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
      twoFactorAuthentication: [''],
    });

    this.passwordInfo();
  }

  private generalInfo() {
    this.generalInfoForm.patchValue({
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
      currentPassword: '********',
      confirmNewPassword: '********',
      newPassword: '********',
      twoFactorAuthentication: 'Yes',
    });
  }

  public deleteUser() {
    const data: ActionModalData = {
      actionIllustration: ActionModalIllustration.delete,
      title: 'Delete user',
      actionColor: 'warn',
      subtext: 'are you sure you want to delete this user from the system?',
      actionType: 'decision',
      decisionText: 'Delete',
    };
    this.dialog.open(ActionModalComponent, {
      maxWidth: '400px',
      maxHeight: '400px',
      width: '100%',
      height: '100%',
      data,
    });
  }
}
