import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BudgetStatisticsComponent } from './budget-statistics.component';

describe('BudgetStatisticsComponent', () => {
  let component: BudgetStatisticsComponent;
  let fixture: ComponentFixture<BudgetStatisticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BudgetStatisticsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BudgetStatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
