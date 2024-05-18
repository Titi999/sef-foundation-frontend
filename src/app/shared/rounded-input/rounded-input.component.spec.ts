import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoundedInputComponent } from './rounded-input.component';

describe('RoundedInputComponent', () => {
  let component: RoundedInputComponent;
  let fixture: ComponentFixture<RoundedInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoundedInputComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RoundedInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
