import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SabtoastSettledComponent } from './sabtoast-settled.component';

describe('SabtoastSettledComponent', () => {
  let component: SabtoastSettledComponent;
  let fixture: ComponentFixture<SabtoastSettledComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SabtoastSettledComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SabtoastSettledComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
