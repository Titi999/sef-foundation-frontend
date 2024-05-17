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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError, finalize, of, Subject, takeUntil } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UserData } from '../types/user';
import { serverError } from '../utils/constants';
import { encodeToBase64, passwordValidator } from '../utils/functions';
import { MatIconModule } from '@angular/material/icon';

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
            const { id, email } = response.data;
            const encodedEmail = encodeToBase64(email);
            this.router.navigate(['/verification', id, encodedEmail]);
          }
        });
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
