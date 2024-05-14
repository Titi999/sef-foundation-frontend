import { Component, inject, OnDestroy } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_FORM_FIELD_DEFAULT_OPTIONS,
  MatFormFieldModule,
} from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { AuthService } from '@app/services/auth.service';
import { catchError, finalize, of, Subject, takeUntil } from 'rxjs';
import { serverError } from '@app/utils/constants';
import { ToastrService } from 'ngx-toastr';

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
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'outline' },
    },
  ],
})
export class ForgotPasswordComponent implements OnDestroy {
  public loading = false;

  public emailForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  private authService = inject(AuthService);
  private toastrService = inject(ToastrService);

  private unsubscribe = new Subject<void>();

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  public onSubmit() {
    if (this.emailForm.valid) {
      const { email } = this.emailForm.value;

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
          }
        });
    }
  }
}
