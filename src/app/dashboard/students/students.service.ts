import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '@app/auth/auth.service';
import { UserRoles } from '@app/auth/auth.type';
import { Student } from '@app/dashboard/students/students.interface';
import { Pagination, Response } from '@app/shared/shared.type';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StudentsService {
  private url = `${environment.apiUrl}/students`;
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  public addStudent(student: Student) {
    return this.http.post<Response<Student>>(
      `${this.url}/add-student`,
      student
    );
  }

  public getStudents(page: string, searchTerm: string) {
    return this.http.get<Response<Pagination<Student[]>>>(
      `${this.url}?page=${page}&searchTerm=${searchTerm}`
    );
  }

  public getBeneficiary(id: string): Observable<Response<Student>> {
    if (this.authService.role() === UserRoles.BENEFICIARY) {
      return this.http.get<Response<Student>>(`${this.url}/beneficiary/${id}`);
    } else {
      return this.http.get<Response<Student>>(`${this.url}/${id}`);
    }
  }

  public createBeneficiary(
    id: string,
    name: string,
    parent: string,
    school: string,
    level: string,
    phone: string,
    parentPhone: string,
    description?: string
  ): Observable<Response<Student>> {
    return this.http.post<Response<Student>>(`${this.url}/add-student/${id}`, {
      name,
      parent,
      school,
      level,
      description,
      phone,
      parentPhone,
    });
  }

  public updateBeneficiary(
    id: string,
    name: string,
    parent: string,
    school: string,
    level: string,
    phone: string,
    parentPhone: string,
    description?: string
  ): Observable<Response<Student>> {
    if (this.authService.role() === UserRoles.BENEFICIARY) {
      return this.http.patch<Response<Student>>(
        `${this.url}/beneficiary/edit-student/${id}`,
        {
          name,
          parent,
          school,
          level,
          description,
          phone,
          parentPhone,
        }
      );
    } else {
      return this.http.patch<Response<Student>>(
        `${this.url}/edit-student/${id}`,
        {
          name,
          parent,
          school,
          level,
          description,
          phone,
          parentPhone,
        }
      );
    }
  }
}
