import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '@app/auth/auth.type';
import { Response } from '@app/shared/shared.type';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private url = `${environment.apiUrl}/users`;
  constructor(private http: HttpClient) {}

  public changeName(id: string, name: string): Observable<Response<User>> {
    return this.http.patch<Response<User>>(`${this.url}/change-name/${id}`, {
      name,
    });
  }

  public changePassword(
    id: string,
    password: string,
    newPassword: string,
    confirmPassword: string
  ): Observable<Response<User>> {
    return this.http.patch<Response<User>>(
      `${this.url}/change-password/${id}`,
      {
        password,
        newPassword,
        confirmPassword,
      }
    );
  }
}
