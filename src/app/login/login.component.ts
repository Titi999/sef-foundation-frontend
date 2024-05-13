import { Component, OnDestroy, inject } from '@angular/core';
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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject, catchError, finalize, of, takeUntil } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UserData } from '../types/user';
import { serverError } from '../utils/constants';
import { encodeToBase64, passwordValidator } from '../utils/functions';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterLink,
    MatProgressSpinnerModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'outline' },
    },
  ],
})
export class LoginComponent implements OnDestroy {
  public loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, passwordValidator]),
  });

  public loading = false;

  public onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value as UserData;

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
            this.toastrService.info(response.message, 'Verification needed');
            const { id, email } = response.data.user;
            const encodedEmail = encodeToBase64(email);
            this.router.navigate(['/verification', id, encodedEmail]);
          }
        });
    }
  }

  private authService = inject(AuthService);
  private toastrService = inject(ToastrService);
  private router = inject(Router);

  private unsubscribe = new Subject<void>();

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
