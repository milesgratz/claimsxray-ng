import { Component, OnInit } from '@angular/core';

import { Utilities } from '../utilities'
import { CxraySession } from '../models/cxay-session';
import { CxraySessionService } from '../services/cxray-session.service';
import { TokenParserService } from '../services/token-parser.service';


@Component({
  selector: 'app-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.css']
})
export class SessionComponent implements OnInit {
  isExpired = false;
  session = new CxraySession();

  constructor(
    private tokenParserService: TokenParserService,
    private cxraySessionService: CxraySessionService
  ){ }

  ngOnInit(): void {
    this.session = this.cxraySessionService.getDetails();
    this.isExpired = this.cxraySessionService.isExpired();
  }

  refreshSession() {
    let tokenRequest = this.session.request;
  
    // update request cache
    this.tokenParserService.setTokenRequest(tokenRequest);
    // restart session
    this.cxraySessionService.enable(this.session.duration);
  
    if (tokenRequest.protocol == 'SAML')
      window.location.href = `${tokenRequest.loginUrl}?SAMLRequest=${Utilities.createSamlRequest(tokenRequest.identifier, this.tokenParserService.replyHostProxy) }`;
    else if (tokenRequest.protocol == 'WS-Fed')
      window.location.href = `${tokenRequest.loginUrl}?${Utilities.createWsFedRequest(tokenRequest.identifier, this.tokenParserService.replyHostProxy)}`;
    else
      Utilities.createAuthCodeRequest(tokenRequest.identifier, tokenRequest.scope, this.tokenParserService.replyHost).then((request) => {
        // store paremters in token parser service for processing callback
        tokenRequest.codeVerifier = request.verifier;
        this.tokenParserService.setTokenRequest(tokenRequest);
        window.location.href = `${tokenRequest.loginUrl}?${request.data}`;
      });
  }
}
