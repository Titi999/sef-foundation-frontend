import { HttpClient } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { finalize, Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { LoginResponse, User, VerifyLogin } from './auth.type';
import { Response } from '@app/shared/shared.type';
import {
  endSession,
  getSession,
  sessionMap,
  setSession,
} from '@app/libs/session';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userSignal = signal<VerifyLogin | undefined>(undefined);

  public readonly loggedInUser = this.userSignal.asReadonly();

  private url = `${environment.apiUrl}/authentication`;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.userSignal.set(getSession(sessionMap.loginResponseTokens));
  }

  public get userName() {
    return computed(() => {
      return this.loggedInUser()?.user.name;
    });
  }

  public get role() {
    return computed(() => {
      return this.loggedInUser()?.user.role;
    });
  }

  // Set user session
  public setUser(response: VerifyLogin) {
    setSession(sessionMap.loginResponseTokens, response);
    this.userSignal.set(response);
  }

  // AuthType login
  public login(
    email: string,
    password: string
  ): Observable<Response<LoginResponse>> {
    return this.http.post<Response<LoginResponse>>(`${this.url}/login`, {
      email,
      password,
    });
  }

  // Verify user using token/code
  public verifyLogin(
    id: string,
    token: string
  ): Observable<Response<VerifyLogin>> {
    return this.http.post<Response<VerifyLogin>>(`${this.url}/verify-login`, {
      id,
      token,
    });
  }

  // Resend code
  public resendCode(id: string): Observable<Response<User>> {
    return this.http.post<Response<User>>(`${this.url}/resend-code`, {
      id,
    });
  }

  // Forgot password
  public forgotPassword(email: string): Observable<Response<User>> {
    return this.http.post<Response<User>>(`${this.url}/forgot-password`, {
      email,
    });
  }

  // Reset password
  public resetPassword(
    token: string,
    password: string,
    confirmPassword: string
  ): Observable<Response<User>> {
    return this.http.post<Response<User>>(`${this.url}/reset-password`, {
      token,
      password,
      confirmPassword,
    });
  }

  public refreshToken(): Observable<Response<{ accessToken: string }>> {
    return this.http.post<Response<{ accessToken: string }>>(
      `${this.url}/refresh-token`,
      {
        refreshToken: this.loggedInUser()?.refreshToken,
      }
    );
  }

  public logout(): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>(`${this.url}/invalidate-token`, {})
      .pipe(
        finalize(() => {
          this.userSignal.set(undefined);
          endSession();
          void this.router.navigateByUrl('/login');
        })
      );
  }
}
