import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalcSettingsComponent } from './calc-settings.component';

describe('CalcSettingsComponent', () => {
  let component: CalcSettingsComponent;
  let fixture: ComponentFixture<CalcSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CalcSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CalcSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
