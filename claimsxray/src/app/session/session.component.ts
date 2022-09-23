import { Component, OnInit } from '@angular/core';

import { CxraySession } from '../models/cxay-session';
import { CxraySessionService } from '../services/cxray-session.service';


@Component({
  selector: 'app-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.css']
})
export class SessionComponent implements OnInit {
  isExpired = false;
  session = new CxraySession();

  constructor(private cxraySessionService: CxraySessionService) { }

  ngOnInit(): void {
    this.session = this.cxraySessionService.getDetails();
    this.isExpired = this.cxraySessionService.isExpired();
  }

}
