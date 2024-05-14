import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { NgOtpInputModule } from 'ng-otp-input';
import { ToastrService } from 'ngx-toastr';
import { catchError, finalize, of, Subject, takeUntil } from 'rxjs';
import { serverError } from '../utils/constants';
import { AuthService } from '@app/services/auth.service';

@Component({
  selector: 'app-verification',
  standalone: true,
  imports: [NgOtpInputModule, MatButtonModule],
  templateUrl: './verification.component.html',
  styleUrl: './verification.component.scss',
})
export class VerificationComponent implements OnInit, OnDestroy {
  public token!: string;
  public loading = false;
  public isButtonEnabled = false;
  public isResendLoading = false;
  private userId!: string;
  private unsubscribe = new Subject<void>();
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastrService = inject(ToastrService);

  public onOtpChange(token: string): void {
    this.token = token;
    this.isButtonEnabled = token.length === 6;
  }

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.unsubscribe)).subscribe(params => {
      this.userId = params['id'];
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  public verifyLogin() {
    if (this.token.length === 6) {
      this.loading = true;
      this.authService
        .verifyLogin(this.userId, this.token)
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
            this.authService.setUser(response);
            this.toastrService.success(
              response.message,
              `Welcome ${response.data.user.name}`
            );
            this.router.navigate(['/dashboard']);
          }
        });
    }
  }

  public resendCode() {
    if (this.userId) {
      this.isResendLoading = true;
      this.authService
        .resendCode(this.userId)
        .pipe(
          catchError(error => {
            this.toastrService.error(
              error.error.message,
              error.error.error || serverError
            );
            return of(null);
          }),
          finalize(() => (this.isResendLoading = false)),
          takeUntil(this.unsubscribe)
        )
        .subscribe(response => {
          if (response) {
            this.toastrService.success(
              response.message,
              'Code has been sent successfully'
            );
          }
        });
    }
  }
}
