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

  inviteUser(email: string, name: string, role: string) {
    return this.http.post<Response<User>>(`${this.url}/invite`, {
      email,
      name,
      role,
    });
  }

  editUser(id: string, email: string, name: string, role: string) {
    return this.http.post<Response<User>>(`${this.url}/edit/${id}`, {
      email,
      name,
      role,
    });
  }

  deleteUser(id: string) {
    return this.http.delete<Response<User>>(`${this.url}/${id}`);
  }

  changeStatus(id: string) {
    return this.http.get<Response<User>>(`${this.url}/status/${id}`);
  }
}
