import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Response } from '@app/shared/shared.type';
import { environment } from '@environments/environment';

export interface School {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  status: 'active' | 'inactive';
}

@Injectable({
  providedIn: 'root',
})
export class SchoolService {
  private readonly baseUrl = `${environment.apiUrl}/schools`;

  constructor(private http: HttpClient) {}

  getAllSchools() {
    return this.http.get<Response<School[]>>(`${this.baseUrl}/all`);
  }
}
