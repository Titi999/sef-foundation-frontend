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
import { AuthService } from '@app/auth/auth.service';
import { catchError, finalize, of, Subject, takeUntil } from 'rxjs';
import { serverError } from '@app/libs/constants';
import { ToastrService } from 'ngx-toastr';
import { ForgotPasswordData } from '@app/auth/auth.type';

import { encodeToBase64 } from '@app/libs/base64';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterLink,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent implements OnDestroy {
  public loading = false;

  public emailForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  private authService = inject(AuthService);
  private toastrService = inject(ToastrService);
  private router = inject(Router);

  private unsubscribe = new Subject<void>();

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  public onSubmit() {
    if (this.emailForm.valid) {
      const { email } = this.emailForm.value as ForgotPasswordData;

      if (!email) {
        return;
      }

      this.loading = true;

      this.authService
        .forgotPassword(email)
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
            this.toastrService.info(response.message);
            const { email } = response.data;
            const encodedEmail = encodeToBase64(email);
            void this.router.navigate(['/check-email', encodedEmail]);
          }
        });
    }
  }
}
