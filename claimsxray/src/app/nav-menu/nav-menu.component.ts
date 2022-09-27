import { Component, OnInit } from '@angular/core';

import { CxraySessionService } from '../services/cxray-session.service';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.css']
})
export class NavMenuComponent implements OnInit {

  isExpanded = false;
  showLogoff = false;

  constructor(private cxraySessionService: CxraySessionService) { }

  ngOnInit(): void {
    this.showLogoff = this.cxraySessionService.isStarted();
  }

  collapse() {
    this.isExpanded = false;
  }

  toggle() {
    this.isExpanded = !this.isExpanded;
  }

  logoff() {
    this.cxraySessionService.end();
    this.showLogoff = this.cxraySessionService.isStarted();
  }

}
