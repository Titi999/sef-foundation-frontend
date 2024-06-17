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

  public getSchools(page: number, searchTerm: string) {
    return this.http.get<Response<Pagination<School[]>>>(
      `${this.baseUrl}?page=${page}&searchTerm=${searchTerm}`
    );
  }

  public addSchool(
    name: string,
    email: string,
    phone: string,
    location: string
  ) {
    return this.http.post<Response<School>>(`${this.baseUrl}`, {
      name,
      email,
      phone,
      location,
    });
  }

  public updateSchool(id: string, school: Omit<School, 'id'>) {
    return this.http.patch<Response<School>>(`${this.baseUrl}`, {
      id,
      school,
    });
  }

  public deleteSchool(id: string): Observable<Response<School>> {
    return this.http.delete<Response<School>>(`${this.baseUrl}/${id}`);
  }
}
