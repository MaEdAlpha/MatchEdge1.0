import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SABToastDeleteComponent } from './sabtoast-delete.component';

describe('SABToastDeleteComponent', () => {
  let component: SABToastDeleteComponent;
  let fixture: ComponentFixture<SABToastDeleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SABToastDeleteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SABToastDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
