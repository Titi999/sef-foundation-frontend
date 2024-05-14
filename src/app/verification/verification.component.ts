import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { NgOtpInputModule } from 'ng-otp-input';
import { ToastrService } from 'ngx-toastr';
import { Subject, catchError, finalize, of, takeUntil } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { serverError } from '../utils/constants';

@Component({
  selector: 'app-verification',
  standalone: true,
  imports: [NgOtpInputModule, MatButtonModule],
  templateUrl: './verification.component.html',
  styleUrl: './verification.component.scss',
})
export class VerificationComponent implements OnInit, OnDestroy {
  private userId!: string;
  public token!: string;
  public loading = false;
  public isButtonEnabled = false;

  private unsubscribe = new Subject<void>();

  public onOtpChange(token: string): void {
    this.token = token;
    this.isButtonEnabled = token.length === 6;
  }

  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastrService = inject(ToastrService);

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
}
