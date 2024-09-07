import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import {
  BudgetAllocation,
  BudgetDetails,
  BudgetDistribution,
  CreateBudget,
  CreateBudgetDistribution,
  CreateFund,
  CreateOtherBudgetDistribution,
  CreateRequest,
  Fund,
  IRequest,
  OtherBudgetDistribution,
} from '@app/dashboard/finance/budget-allocation/budget-allocation.interface';
import { Observable } from 'rxjs';
import {
  IBeneficiaryOverviewStatistics,
  IOverviewStatistics,
  IPerformance,
  Pagination,
  Response,
} from '@app/shared/shared.type';
import {
  CreateDisbursement,
  Disbursement,
} from '@app/dashboard/finance/disbursement/disbursement.interface';
import { AuthService } from '@app/auth/auth.service';
import { FinanceReportInterface } from '@app/dashboard/finance/financial-report/finance-report.interface';
import { User, UserRoles } from '@app/auth/auth.type';

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
    period: string,
    year: string
  ): Observable<Response<Pagination<BudgetAllocation[]>>> {
    return this.http.get<Response<Pagination<BudgetAllocation[]>>>(
      `${this.url}/budgets?page=${page}&period=${period}&year=${year}`
    );
  }

  public getAllBudgets(): Observable<Response<BudgetAllocation[]>> {
    return this.http.get<Response<BudgetAllocation[]>>(
      `${this.url}/budgets/all`
    );
  }

  public getBudget(id: string): Observable<Response<BudgetAllocation>> {
    return this.http.get<Response<BudgetAllocation>>(
      `${this.url}/budgets/${id}`
    );
  }

  public getBudgetDetails(
    id: string,
    search: string
  ): Observable<Response<BudgetDetails>> {
    return this.http.get<Response<BudgetDetails>>(
      `${this.url}/budget-details/${id}?search=${search}`
    );
  }

  public getDisbursement(id: string): Observable<Response<Disbursement>> {
    return this.http.get<Response<Disbursement>>(
      `${this.url}/disbursement/${id}`
    );
  }

  public createBudget(budgetData: CreateBudget) {
    return this.http.post<Response<BudgetAllocation>>(
      `${this.url}/budget`,
      budgetData
    );
  }

  public createRequest(createRequest: CreateRequest) {
    return this.http.post<Response<IRequest>>(
      `${this.url}/request`,
      createRequest
    );
  }

  public createBudgetDistribution(
    createBudgetDistribution: CreateBudgetDistribution[],
    id: string
  ) {
    return this.http.post<Response<BudgetDistribution[]>>(
      `${this.url}/budget/${id}`,
      createBudgetDistribution
    );
  }

  public createFund(createFund: CreateFund) {
    return this.http.post<Response<Fund>>(`${this.url}/fund`, createFund);
  }

  public editFund(id: string, createFund: CreateFund) {
    return this.http.patch<Response<Fund>>(
      `${this.url}/fund/${id}`,
      createFund
    );
  }

  public deleteFund(id: string) {
    return this.http.delete<Response<Fund>>(`${this.url}/fund/${id}`);
  }

  public getFund(page: number, period: string, year: string) {
    return this.http.get<Response<Pagination<Fund[]>>>(
      `${this.url}/fund?page=${page}&period=${period}&year=${year}`
    );
  }

  public createOtherBudgetDistribution(
    createBudgetDistribution: CreateOtherBudgetDistribution,
    id: string
  ) {
    return this.http.post<Response<OtherBudgetDistribution>>(
      `${this.url}/other-budget/${id}`,
      createBudgetDistribution
    );
  }

  public editBudget(id: string, budgetData: CreateBudget) {
    return this.http.patch<Response<BudgetAllocation>>(
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

  public editRequest(id: string, createRequest: CreateRequest) {
    return this.http.patch<Response<IRequest>>(
      `${this.url}/request/${id}`,
      createRequest
    );
  }

  public deleteRequest(id: string) {
    return this.http.delete<Response<IRequest>>(`${this.url}/request/${id}`);
  }

  public approveRequest(id: string) {
    return this.http.get<Response<IRequest>>(
      `${this.url}/request/approve/${id}`
    );
  }

  public declineRequest(id: string) {
    return this.http.get<Response<IRequest>>(
      `${this.url}/request/decline/${id}`
    );
  }

  public deleteDisbursementByBeneficiary(id: string) {
    return this.http.delete(`${this.url}/disbursement/${id}`);
  }

  public getDisbursements(
    page: number,
    period: string,
    search: string,
    year: string
  ): Observable<Response<Pagination<Disbursement[]>>> {
    return this.http.get<Response<Pagination<Disbursement[]>>>(
      `${this.url}/disbursements?page=${page}&period=${period}&search=${search}&year=${year}`
    );
  }

  public getRequest(
    page: number,
    status: string
  ): Observable<Response<Pagination<IRequest[]>>> {
    const { role, id } = this.authService.loggedInUser()?.user as User;
    const userId = role === UserRoles.BENEFICIARY ? id : '';
    return this.http.get<Response<Pagination<IRequest[]>>>(
      `${this.url}/requests?userId=${userId}&page=${page}&status=${status}`
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
    year: string,
    period: string
  ): Observable<
    Response<IOverviewStatistics | IBeneficiaryOverviewStatistics>
  > {
    if (this.authService.role() === UserRoles.BENEFICIARY) {
      const id = this.authService.loggedInUser()?.user.id;
      return this.http.get<Response<IOverviewStatistics>>(
        `${this.url}/statistics/${id}?year=${year}&period=${period}`
      );
    } else {
      return this.http.get<Response<IBeneficiaryOverviewStatistics>>(
        `${this.url}/statistics?year=${year}&period=${period}`
      );
    }
  }

  public getReports(
    period: string,
    year: string
  ): Observable<Response<FinanceReportInterface>> {
    return this.http.get<Response<FinanceReportInterface>>(
      `${this.url}/report?period=${period}&year=${year}`
    );
  }

  public getPerformance(
    search: string,
    page: number,
    type: string,
    year: string,
    category: string[]
  ): Observable<Response<IPerformance>> {
    return this.http.get<Response<IPerformance>>(
      `${this.url}/performance?page=${page}&search=${search}&type=${type}&year=${year}&category=${category}`
    );
  }

  public downloadCSV(filePath: string) {
    return this.http.get(filePath, { responseType: 'blob' });
  }
}
