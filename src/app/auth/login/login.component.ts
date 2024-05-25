import { Component, inject, OnDestroy } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError, finalize, of, Subject, takeUntil } from 'rxjs';
import { serverError } from '@app/libs/constants';
import { passwordValidator } from '@app/libs/validators';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '@app/auth/auth.service';
import { UserLoginData } from '@app/auth/auth.type';
import { encodeToBase64 } from '@app/libs/base64';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterLink,
    MatIconModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnDestroy {
  public loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, passwordValidator]),
  });

  public loading = false;
  public togglePassword = true;
  private authService = inject(AuthService);
  private toastrService = inject(ToastrService);
  private router = inject(Router);
  private unsubscribe = new Subject<void>();

  public onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value as UserLoginData;

      this.loading = true;

      this.authService
        .login(email, password)
        .pipe(
          catchError(error => {
            this.toastrService.error(
              error.error.message,
              error.error.error || serverError
            );
            return of(null);
          }),
          finalize(() => (this.loading = false)),
          takeUntil(this.unsubscribe)
        )
        .subscribe(response => {
          if (response) {
            if (response.data.token) {
              this.toastrService.info(response.message, 'Reset your password');
              void this.router.navigate([
                '/reset-password',
                response.data.token,
              ]);
            } else {
              this.toastrService.info(response.message, 'Verification needed');
              const { id, email } = response.data.user;
              const encodedEmail = encodeToBase64(email);
              void this.router.navigate(['/verification', id, encodedEmail]);
            }
          }
        });
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
