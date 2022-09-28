import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil } from 'rxjs/operators';

import { CxraySessionService } from '../services/cxray-session.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy{

  unsubscribe$: Subject<boolean> = new Subject();

  hasSession = false;

  constructor(private cxraySessionService: CxraySessionService){ }

  ngOnInit(): void {
    // subscription
    this.cxraySessionService.started
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(state => { this.hasSession = state.started; });
  }

  ngOnDestroy(): void{
    this.unsubscribe$.next(true);
    this.unsubscribe$.complete();
  }
}
