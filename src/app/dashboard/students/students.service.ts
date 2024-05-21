import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Student } from '@app/dashboard/students/students.interface';
import { environment } from '@environments/environment';
import { Pagination, Response } from '@app/shared/shared.type';

@Injectable({
  providedIn: 'root',
})
export class StudentsService {
  private url = `${environment.apiUrl}/students`;
  constructor(private http: HttpClient) {}

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
}