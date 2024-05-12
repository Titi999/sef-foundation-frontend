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
import { RouterLink } from '@angular/router';
import { Subject, catchError, finalize, of, takeUntil } from 'rxjs';
import { LoginService } from '../services/login.service';
import { UserData } from '../types/user';
import { passwordValidator } from '../utils/functions';

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

      this.loginService
        .login(email, password)
        .pipe(
          catchError(error => {
            console.log('login', error);
            return of(null);
          }),
          finalize(() => (this.loading = false)),
          takeUntil(this.unsubscribe)
        )
        .subscribe(response => {
          if (response) {
            console.log('login response', response);
          }
        });
    }
  }

  private loginService = inject(LoginService);

  private unsubscribe = new Subject<void>();

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
