import { TestBed } from '@angular/core/testing';

import { EXpenseService } from './expense.service';

describe('EXpenseService', () => {
  let service: EXpenseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EXpenseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
