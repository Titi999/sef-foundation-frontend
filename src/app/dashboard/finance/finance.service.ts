import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import {
  BudgetAllocation,
  BudgetDistribution,
  CreateBudget,
} from '@app/dashboard/finance/budget-allocation/budget-allocation.interface';
import { Observable } from 'rxjs';
import { Pagination, Response } from '@app/shared/shared.type';
import { Disbursement } from '@app/dashboard/finance/disbursement/disbursement.interface';

@Injectable({
  providedIn: 'root',
})
export class FinanceService {
  private url = `${environment.apiUrl}/finance`;
  constructor(private readonly http: HttpClient) {}

  public getBudgets(
    page: number
  ): Observable<Response<Pagination<BudgetAllocation[]>>> {
    return this.http.get<Response<Pagination<BudgetAllocation[]>>>(
      `${this.url}/budgets?page=${page}`
    );
  }

  public createBudget(budgetData: CreateBudget) {
    return this.http.post<Response<BudgetDistribution>>(
      `${this.url}/budget`,
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
}
