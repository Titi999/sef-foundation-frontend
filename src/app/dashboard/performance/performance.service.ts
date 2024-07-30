import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HttpClient } from '@angular/common/http';
import { Response } from '@app/shared/shared.type';
import { AcademicPerformanceWithRanks } from '@app/dashboard/performance/performance.interface';

@Injectable({
  providedIn: 'root',
})
export class PerformanceService {
  private apiUrl = `${environment.apiUrl}/academics`;

  constructor(private readonly http: HttpClient) {}

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
}
