import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Pagination, Response } from '@app/shared/shared.type';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';

export interface School {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  status: 'active' | 'inactive';
  classes: string[];
}

@Injectable({
  providedIn: 'root',
})
export class SchoolService {
  private readonly baseUrl = `${environment.apiUrl}/schools`;

  constructor(private http: HttpClient) {}

  public getAllSchools() {
    return this.http.get<Response<School[]>>(`${this.baseUrl}/all`);
  }

  public getSchools(page: number, searchTerm: string, status: string) {
    return this.http.get<Response<Pagination<School[]>>>(
      `${this.baseUrl}?page=${page}&searchTerm=${searchTerm}&status=${status}`
    );
  }

  public addSchool(
    name: string,
    email: string,
    phone: string,
    location: string,
    classes: string[]
  ) {
    return this.http.post<Response<School>>(`${this.baseUrl}`, {
      name,
      email,
      phone,
      location,
      classes,
    });
  }

  public updateSchool(
    id: string,
    name: string,
    email: string,
    phone: string,
    location: string,
    classes: string[]
  ) {
    return this.http.patch<Response<School>>(`${this.baseUrl}/${id}`, {
      name,
      email,
      phone,
      location,
      classes,
    });
  }

  public deleteSchool(id: string): Observable<Response<School>> {
    return this.http.delete<Response<School>>(`${this.baseUrl}/${id}`);
  }

  public activateSchool(id: string): Observable<Response<School>> {
    return this.http.patch<Response<School>>(
      `${this.baseUrl}/activate/${id}`,
      {}
    );
  }

  public deactivateSchool(id: string): Observable<Response<School>> {
    return this.http.patch<Response<School>>(
      `${this.baseUrl}/deactivate/${id}`,
      {}
    );
  }
}
