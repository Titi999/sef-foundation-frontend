import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { Pagination, Response } from '@app/shared/shared.type';
import { User } from '@app/auth/auth.type';

@Injectable({
  providedIn: 'root',
})
export class UserAdministrationService {
  private readonly url = `${environment.apiUrl}/users`;
  constructor(private readonly http: HttpClient) {}

  getUsers(search: string = '') {
    return this.http.get<Response<Pagination<User[]>>>(
      `${this.url}?searchTerm=${search}`
    );
  }
}
