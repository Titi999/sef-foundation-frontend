import { HttpClient } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Response, User, VerifyLogin } from '../types/user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userSignal = signal<VerifyLogin | undefined>(undefined);

  public readonly loggedInUser = this.userSignal.asReadonly();

  private url = `${environment.apiUrl}/authentication`;

  constructor(private http: HttpClient) {
    this.userSignal.set(
      JSON.parse(window.localStorage.getItem('user') as string)
    );
  }

  public get userName() {
    return computed(() => {
      return this.loggedInUser()?.user.name;
    });
  }

  // Set user session
  public setUser(response: VerifyLogin) {
    window.localStorage.setItem('user', JSON.stringify(response));
    this.userSignal.set(response);
  }

  // User login
  public login(email: string, password: string): Observable<Response<User>> {
    return this.http.post<Response<User>>(`${this.url}/login`, {
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
    return this.http.post<Response<User>>(`${this.url}/resend-code`, { id });
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
}
