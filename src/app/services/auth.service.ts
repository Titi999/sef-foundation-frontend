import { HttpClient } from '@angular/common/http';
import {computed, Injectable, signal} from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Response, UserLoginResponse, VerifyLogin } from '../types/user';

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

  // Set user session
  public setUser(response: VerifyLogin) {
    window.localStorage.setItem('user', JSON.stringify(response));
    this.userSignal.set(response);
  }

  // User login
  public login(email: string, password: string): Observable<UserLoginResponse> {
    return this.http.post<UserLoginResponse>(`${this.url}/login`, {
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
  public resendCode(id: string): Observable<Response<UserLoginResponse>> {
    return this.http.post<Response<UserLoginResponse>>(
      `${this.url}/resend-code`,
      { id }
    );
  }

  // Forgot password
  public forgotPassword(
    email: string
  ): Observable<Response<UserLoginResponse>> {
    return this.http.post<Response<UserLoginResponse>>(
      `${this.url}/forgot-password`,
      { email }
    );
  }

  public get userName() {
    return computed(() => {
      return this.loggedInUser()?.user.name
    })
  }
}
