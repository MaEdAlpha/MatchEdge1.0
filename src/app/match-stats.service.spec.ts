import { TestBed } from '@angular/core/testing';

import { MatchStatsService } from './match-stats.service';

describe('MatchStatsService', () => {
  let service: MatchStatsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MatchStatsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
