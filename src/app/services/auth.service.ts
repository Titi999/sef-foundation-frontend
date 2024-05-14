import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Response, UserLoginResponse, VerifyLogin } from '../types/user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userSignal = signal<UserLoginResponse | undefined>(undefined);

  public readonly loggedInUser = this.userSignal.asReadonly();

  private url = `${environment.apiUrl}/authentication`;

  constructor(private http: HttpClient) {
    this.userSignal.set(
      JSON.parse(window.localStorage.getItem('user') as string)
    );
  }

  // Check if user is authenticated
  public isAuthenticated(): boolean {
    if (!this.loggedInUser()) {
      return false;
    }

    return true;
  }

  // Set user session
  public setUser(response: UserLoginResponse) {
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
}
