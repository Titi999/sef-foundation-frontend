import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserLoginResponse } from '../types/user';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private http = inject(HttpClient);

  public login(email: string, password: string): Observable<UserLoginResponse> {
    return this.http.post<UserLoginResponse>(
      `${environment.apiUrl}/authentication/login`,
      {
        email,
        password,
      }
    );
  }
}
