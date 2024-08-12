import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPerformanceComponent } from './add-performance.component';

describe('AddPerformanceComponent', () => {
  let component: AddPerformanceComponent;
  let fixture: ComponentFixture<AddPerformanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddPerformanceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddPerformanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
