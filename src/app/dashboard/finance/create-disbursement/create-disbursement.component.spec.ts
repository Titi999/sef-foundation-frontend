import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateDisbursementComponent } from './create-disbursement.component';

describe('CreateDisbursementComponent', () => {
  let component: CreateDisbursementComponent;
  let fixture: ComponentFixture<CreateDisbursementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateDisbursementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateDisbursementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
