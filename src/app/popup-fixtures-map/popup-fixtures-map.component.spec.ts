import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupFixturesMapComponent } from './popup-fixtures-map.component';

describe('PopupFixturesMapComponent', () => {
  let component: PopupFixturesMapComponent;
  let fixture: ComponentFixture<PopupFixturesMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupFixturesMapComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupFixturesMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
