import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HttpClient } from '@angular/common/http';
import { Pagination, Response } from '@app/shared/shared.type';
import {
  AcademicPerformanceWithRanks,
  BeneficiaryAcademicPerformance,
  CreateAcademics,
} from '@app/dashboard/performance/performance.interface';
import { AuthService } from '@app/auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class PerformanceService {
  private apiUrl = `${environment.apiUrl}/academics`;
  private userId = this.authService.loggedInUser()?.user.id;

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService
  ) {}

  public getAcademicPerformance(
    search: string,
    page: number,
    term: string,
    year: string
  ) {
    return this.http.get<Response<AcademicPerformanceWithRanks>>(
      `${this.apiUrl}/performances?page=${page}&searchTerm=${search}&year=${year}&term=${term}`
    );
  }

  public addBeneficiaryAcademicPerformance(academic: CreateAcademics) {
    return this.http.post<Response<BeneficiaryAcademicPerformance>>(
      `${this.apiUrl}/create/${this.userId}`,
      academic
    );
  }

  public editBeneficiaryAcademicPerformance(
    id: string,
    academic: CreateAcademics
  ) {
    return this.http.put<Response<BeneficiaryAcademicPerformance>>(
      `${this.apiUrl}/update/${this.userId}/${id}`,
      academic
    );
  }

  public getBeneficiaryAcademicPerformance(
    search: string,
    page = 1,
    term: string,
    year: string
  ) {
    return this.http.get<
      Response<Pagination<BeneficiaryAcademicPerformance[]>>
    >(
      `${this.apiUrl}/performances/${this.userId}?page=${page}&searchTerm=${search}&year=${year}&term=${term}`
    );
  }

  public deleteBeneficiaryAcademicPerformance(id: string) {
    return this.http.delete<Response<BeneficiaryAcademicPerformance>>(
      `${this.apiUrl}/delete/${this.userId}/${id}`
    );
  }
}
