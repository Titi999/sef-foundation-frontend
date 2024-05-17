import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '@app/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { catchError, finalize, of, Subject, takeUntil } from 'rxjs';
import { ResetPasswordData } from '@app/types/user';
import { serverError } from '@app/utils/constants';
import { MatIconModule } from '@angular/material/icon';
import {
  passwordMatchValidator,
  passwordValidator,
} from '@app/utils/functions';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterLink,
    MatIconModule,
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  public loading = false;
  public token!: string;
  public togglePassword = true;
  public toggleConfirmPassword = true;

  public resetPasswordForm = new FormGroup(
    {
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        passwordValidator(),
      ]),
      confirmPassword: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        passwordValidator(),
      ]),
    },
    { validators: passwordMatchValidator }
  );

  private authService = inject(AuthService);
  private toastrService = inject(ToastrService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  private unsubscribe = new Subject<void>();

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.unsubscribe)).subscribe(params => {
      this.token = params['token'];
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  public onSubmit() {
    if (this.resetPasswordForm.valid) {
      const { password, confirmPassword } = this.resetPasswordForm
        .value as ResetPasswordData;

      if (!this.token || !password || !confirmPassword) {
        return;
      }

      this.loading = true;

      this.authService
        .resetPassword(this.token, password, confirmPassword)
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
            this.toastrService.success(response.message);
            void this.router.navigate(['/login']);
          }
        });
    }
  }
}
