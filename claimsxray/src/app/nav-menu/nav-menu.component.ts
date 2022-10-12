import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil } from 'rxjs/operators';

import { CxraySessionService } from '../services/cxray-session.service';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.css']
})
export class NavMenuComponent implements OnInit, OnDestroy {

  unsubscribe$: Subject<boolean> = new Subject();

  hasSession = false;
  hasToken = false;
  hasAccessToken = false;

  constructor(private cxraySessionService: CxraySessionService) { }

  ngOnInit(): void {
    // subscription
    this.cxraySessionService.started
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(state => {
        this.hasSession = state.started;
        this.hasToken = state.token;
        this.hasAccessToken = state.accessToken;
      });
  }

  ngOnDestroy(): void{
    this.unsubscribe$.next(true);
    this.unsubscribe$.complete();
  }

  logoff() {
    this.cxraySessionService.end();
    //this.hasSession = this.cxraySessionService.isStarted();
  }
}
