import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopLayerFiltersComponent } from './top-layer-filters.component';

describe('TopLayerFiltersComponent', () => {
  let component: TopLayerFiltersComponent;
  let fixture: ComponentFixture<TopLayerFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TopLayerFiltersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TopLayerFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
