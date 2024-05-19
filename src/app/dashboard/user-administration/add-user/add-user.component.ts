import { Component, Inject } from '@angular/core';
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
import { MatButton } from '@angular/material/button';
import { UserAdministrationService } from '@app/dashboard/user-administration/user-administration.service';
import { AddUser } from '@app/dashboard/user-administration/add-user/add-user.type';
import { catchError, finalize, first, of } from 'rxjs';
import { serverError } from '@app/libs/constants';
import { ToastrService } from 'ngx-toastr';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogClose,
  MatDialogRef,
} from '@angular/material/dialog';
import {
  ActionModalData,
  ActionModalIllustration,
} from '@app/shared/action-modal/action-modal.type';
import { ActionModalComponent } from '@app/shared/action-modal/action-modal.component';
import { UserRoles } from '@app/auth/auth.type';

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
    MatDialogClose,
  ],
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.scss',
})
export class AddUserComponent {
  public title!: string;
  public subtext!: string;
  public isLoading: boolean = false;
  public buttonText!: string;
  public userForm = new FormGroup({
    name: new FormControl('', [Validators.required, fullNameValidator()]),
    email: new FormControl('', [Validators.required, Validators.email]),
    role: new FormControl('', [Validators.required]),
  });

  public roles = [
    { name: 'Super Admin', value: UserRoles.SUPER_ADMIN },
    { name: 'Admin', value: UserRoles.ADMIN },
    { name: 'Beneficiary', value: UserRoles.BENEFICIARY },
  ];

  constructor(
    private readonly userAdministrationService: UserAdministrationService,
    private readonly toastrService: ToastrService,
    private readonly dialog: MatDialog,
    public dialogRef: MatDialogRef<AddUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddUser & { id: string }
  ) {
    if (data) {
      this.title = 'Edit user details';
      this.subtext = 'kindly fill in the details to update the user';
      this.buttonText = 'Update';
      this.userForm.patchValue(data);
    } else {
      this.title = 'Add a new user';
      this.subtext = 'kindly fill in the details to create a new user';
      this.buttonText = 'Send invite';
    }
  }

  submit() {
    if (this.userForm.valid) {
      this.isLoading = true;
      this.dialogRef.disableClose = true;
      const { email, role, name } = this.userForm.value as AddUser;
      if (this.data) {
        this.userAdministrationService
          .editUser(this.data.id, email, name, role)
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
                subtext: 'Great, user has been successfully edited',
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
        this.userAdministrationService
          .inviteUser(email, name, role)
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
                subtext:
                  'Well done, an invite has been sent to the user you created',
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
