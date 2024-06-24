import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import {
  BudgetAllocation,
  BudgetDistribution,
  CreateBudget,
} from '@app/dashboard/finance/budget-allocation/budget-allocation.interface';
import { Observable } from 'rxjs';
import {
  IOverviewStatistics,
  Pagination,
  Response,
} from '@app/shared/shared.type';
import {
  CreateDisbursement,
  Disbursement,
} from '@app/dashboard/finance/disbursement/disbursement.interface';
import { AuthService } from '@app/auth/auth.service';
import { BudgetAllocationComponent } from '@app/dashboard/finance/budget-allocation/budget-allocation.component';
import { FinanceReportInterface } from '@app/dashboard/finance/financial-report/finance-report.interface';

@Injectable({
  providedIn: 'root',
})
export class FinanceService {
  private url = `${environment.apiUrl}/finance`;
  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService
  ) {}

  public getBudgets(
    page: number,
    status: string
  ): Observable<Response<Pagination<BudgetAllocation[]>>> {
    return this.http.get<Response<Pagination<BudgetAllocation[]>>>(
      `${this.url}/budgets?page=${page}&status=${status}`
    );
  }

  public getBudget(id: string): Observable<Response<BudgetAllocation>> {
    return this.http.get<Response<BudgetAllocation>>(
      `${this.url}/budgets/${id}`
    );
  }

  public getDisbursement(id: string): Observable<Response<Disbursement>> {
    return this.http.get<Response<Disbursement>>(
      `${this.url}/disbursement/${id}`
    );
  }

  public createBudget(budgetData: CreateBudget) {
    return this.http.post<Response<BudgetDistribution>>(
      `${this.url}/budget`,
      budgetData
    );
  }

  public editBudget(id: string, budgetData: CreateBudget) {
    return this.http.patch<Response<BudgetDistribution>>(
      `${this.url}/budget/${id}`,
      budgetData
    );
  }

  public editDisbursement(id: string, disbursementData: CreateDisbursement) {
    return this.http.patch<Response<Disbursement>>(
      `${this.url}/disbursement/${id}`,
      disbursementData
    );
  }

  public editRequest(
    id: string,
    disbursementData: Omit<CreateDisbursement, 'studentId'>
  ) {
    const userId = this.authService.loggedInUser()?.user.id;
    return this.http.patch<Response<Disbursement>>(
      `${this.url}/request/${userId}/${id}`,
      disbursementData
    );
  }

  public deleteBudget(id: string) {
    return this.http.delete<Response<BudgetAllocationComponent>>(
      `budget/${id}`
    );
  }

  public deleteDisbursementByBeneficiary(id: string) {
    return this.http.delete(`${this.url}/disbursement/${id}`);
  }

  public getDisbursements(
    page: number,
    status: string,
    search: string
  ): Observable<Response<Pagination<Disbursement[]>>> {
    return this.http.get<Response<Pagination<Disbursement[]>>>(
      `${this.url}/disbursements?page=${page}&status=${status}&search=${search}`
    );
  }

  public getBeneficiaryDisbursements(
    page: number,
    status: string
  ): Observable<Response<Pagination<Disbursement[]>>> {
    const id = this.authService.loggedInUser()?.user.id;
    return this.http.get<Response<Pagination<Disbursement[]>>>(
      `${this.url}/disbursements/${id}?page=${page}&status=${status}`
    );
  }

  public approveDisbursement(id: string): Observable<Response<Disbursement>> {
    return this.http.get<Response<Disbursement>>(
      `${this.url}/disbursements/approve/${id}`
    );
  }

  public declineDisbursement(id: string): Observable<Response<Disbursement>> {
    return this.http.get<Response<Disbursement>>(
      `${this.url}/disbursements/decline/${id}`
    );
  }

  public createDisbursement(disbursementData: CreateDisbursement) {
    return this.http.post<Response<Disbursement>>(
      `${this.url}/disbursement`,
      disbursementData
    );
  }

  public createBeneficiaryDisbursement(
    disbursementData: Omit<CreateDisbursement, 'studentId'>
  ) {
    const id = this.authService.loggedInUser()?.user.id;
    return this.http.post<Response<Disbursement>>(
      `${this.url}/disbursement/${id}`,
      disbursementData
    );
  }

  public getStatistics(
    year: string
  ): Observable<Response<IOverviewStatistics>> {
    return this.http.get<Response<IOverviewStatistics>>(
      `${this.url}/statistics?year=${year}`
    );
  }

  public getReports(
    year: string
  ): Observable<Response<FinanceReportInterface[]>> {
    return this.http.get<Response<FinanceReportInterface[]>>(
      `${this.url}/report?year=${year}`
    );
  }
}
