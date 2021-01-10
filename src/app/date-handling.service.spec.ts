import { TestBed } from '@angular/core/testing';

import { DateHandlingService } from './date-handling.service';

describe('DateHandlingService', () => {
  let service: DateHandlingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DateHandlingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
