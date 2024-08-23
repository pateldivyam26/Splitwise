import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FairnessCalculatorComponent } from './fairness-calculator.component';

describe('FairnessCalculatorComponent', () => {
  let component: FairnessCalculatorComponent;
  let fixture: ComponentFixture<FairnessCalculatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FairnessCalculatorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FairnessCalculatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
