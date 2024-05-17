import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { Paginations } from '@app/types/common';
import { User, Response } from '@app/types/user';

@Injectable({
  providedIn: 'root',
})
export class UserAdministrationService {
  private readonly url = `${environment.apiUrl}/users`;
  constructor(private readonly http: HttpClient) {}

  getUsers(search: string = '') {
    return this.http.get<Response<Paginations<User[]>>>(
      `${this.url}?searchTerm=${search}`
    );
  }
}
