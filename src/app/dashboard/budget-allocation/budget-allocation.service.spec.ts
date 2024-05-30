import { TestBed } from '@angular/core/testing';

import { BudgetAllocationService } from './budget-allocation.service';

describe('BudgetAllocationService', () => {
  let service: BudgetAllocationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BudgetAllocationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
