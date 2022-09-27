import { Component, OnInit } from '@angular/core';

import { CxraySessionService } from '../services/cxray-session.service';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.css']
})
export class NavMenuComponent implements OnInit {

  isExpanded = false;
  hasSession = false;
  hasToken = false;
  hasAccessToken = false;

  constructor(private cxraySessionService: CxraySessionService) { }

  ngOnInit(): void {
    this.hasSession = this.cxraySessionService.isStarted();
    let tokens = this.cxraySessionService.getDetails().tokens;
    this.hasToken = tokens.length > 0;
    this.hasAccessToken = tokens.length > 1;
  }

  collapse() {
    this.isExpanded = false;
  }

  toggle() {
    this.isExpanded = !this.isExpanded;
  }

  logoff() {
    this.cxraySessionService.end();
    this.hasSession = this.cxraySessionService.isStarted();
  }

}
