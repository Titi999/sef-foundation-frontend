import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  CreateStudent,
  Student,
} from '@app/dashboard/students/students.interface';
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

  public addStudent(student: Omit<CreateStudent, 'id'>) {
    return this.http.post<Response<Student>>(
      `${this.url}/add-student`,
      student
    );
  }

  public getStudents(page: number, searchTerm: string, status: string) {
    return this.http.get<Response<Pagination<Student[]>>>(
      `${this.url}/get?page=${page}&searchTerm=${searchTerm}&status=${status}`
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
    grandParent: string,
    greatGrandparent: string,
    boardingHouse: boolean,
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
      grandParent,
      greatGrandparent,
      boardingHouse,
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
    grandParent: string,
    greatGrandparent: string,
    boardingHouse: boolean,
    description?: string
  ): Observable<Response<Student>> {
    if (this.authService.role() === UserRoles.BENEFICIARY) {
      return this.http.patch<Response<Student>>(
        `${this.url}/beneficiary/edit-student/${this.authService.loggedInUser()?.user.id}`,
        {
          name,
          parent,
          school,
          level,
          description,
          phone,
          parentPhone,
          grandParent,
          greatGrandparent,
          boardingHouse,
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
          grandParent,
          greatGrandparent,
          boardingHouse,
        }
      );
    }
  }

  public getAllStudents(
    user: 'yes' | 'no' = 'no'
  ): Observable<Response<Student[]>> {
    return this.http.get<Response<Student[]>>(`${this.url}/all?user=${user}`);
  }

  public deleteStudent(id: string): Observable<Response<Student>> {
    return this.http.delete<Response<Student>>(`${this.url}/${id}`);
  }

  public activateStudent(id: string) {
    return this.http.get<Response<Student>>(`${this.url}/activate/${id}`);
  }

  public deactivateStudent(id: string) {
    return this.http.get<Response<Student>>(`${this.url}/deactivate/${id}`);
  }

  public beneficiaryInfoExists() {
    const id = this.authService.loggedInUser()?.user.id;
    return this.http.get<Response<boolean>>(
      `${this.url}/beneficiary-exists/${id}`
    );
  }
}
