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

  public getDisbursements(
    page: number
  ): Observable<Response<Pagination<Disbursement[]>>> {
    return this.http.get<Response<Pagination<Disbursement[]>>>(
      `${this.url}/disbursements?page=${page}`
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

  public getStatistics(): Observable<Response<IOverviewStatistics>> {
    return this.http.get<Response<IOverviewStatistics>>(
      `${this.url}/statistics`
    );
  }
}
