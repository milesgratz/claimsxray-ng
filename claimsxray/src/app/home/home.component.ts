import { Component } from '@angular/core';

import { CxraySessionService } from '../services/cxray-session.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  hasSession = false;

  constructor(private cxraySessionService: CxraySessionService){ }

  ngOnInit() {
    this.hasSession = this.cxraySessionService.isStarted();
  }
}
