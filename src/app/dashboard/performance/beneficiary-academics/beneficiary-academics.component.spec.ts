import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BeneficiaryAcademicsComponent } from './beneficiary-academics.component';

describe('BeneficiaryAcademicsComponent', () => {
  let component: BeneficiaryAcademicsComponent;
  let fixture: ComponentFixture<BeneficiaryAcademicsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BeneficiaryAcademicsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BeneficiaryAcademicsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
