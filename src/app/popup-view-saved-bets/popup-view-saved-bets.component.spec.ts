import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupViewSavedBetsComponent } from './popup-view-saved-bets.component';

describe('PopupViewSavedBetsComponent', () => {
  let component: PopupViewSavedBetsComponent;
  let fixture: ComponentFixture<PopupViewSavedBetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupViewSavedBetsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupViewSavedBetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
