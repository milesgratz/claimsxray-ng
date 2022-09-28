import { TestBed } from '@angular/core/testing';

import { CxraySessionService } from './cxray-session.service';

describe('CxraySessionService', () => {
  let service: CxraySessionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CxraySessionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
