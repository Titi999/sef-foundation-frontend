import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Student } from '@app/dashboard/students/students.interface';
import { environment } from '@environments/environment';
import { Pagination, Response } from '@app/shared/shared.type';
import { UserRoles } from '@app/auth/auth.type';
import { Observable } from 'rxjs';
import { AuthService } from '@app/auth/auth.service';

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

  public getStudents(page: number, searchTerm: string, status: string) {
    return this.http.get<Response<Pagination<Student[]>>>(
      `${this.url}?page=${page}&searchTerm=${searchTerm}&status=${status}`
    );
  }

  public editStudent(id: string, student: Omit<Student, 'id'>) {
    return this.http.patch<Response<Student>>(
      `${this.url}/edit-student/${id}`,
      student
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

  public getAllStudents(): Observable<Response<Student[]>> {
    return this.http.get<Response<Student[]>>(`${this.url}/all`);
  }
}
