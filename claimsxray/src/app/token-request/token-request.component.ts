import { Component, OnInit } from '@angular/core';

import { Utilities } from '../utilities'
import { TokenRequest } from '../models/token-request';
import { TokenParserService } from '../services/token-parser.service';
import { CxraySessionService } from '../services/cxray-session.service';

@Component({
  selector: 'app-token-request',
  templateUrl: './token-request.component.html'
})
export class TokenRequestComponent implements OnInit {
  protocols = ['SAML', 'WS-Fed', 'Open ID'];
  model: TokenRequest = new TokenRequest();
  submitted = false;

  constructor(
    private tokenParserService: TokenParserService,
    private cxraySessionService: CxraySessionService
  ){ }

  ngOnInit() {
    this.model = this.tokenParserService.getTokenRequest();
    if (this.model.protocol == '')
      this.model.protocol = 'SAML';
  }

  onSubmit() {
    //enable session
    if (this.model.sessionDuration > 0)
      this.cxraySessionService.enable(this.model.sessionDuration);
    else
      this.cxraySessionService.end();

    // update request cache
    this.tokenParserService.setTokenRequest(this.model);

    if (this.model.protocol == 'SAML')
      window.location.href = `${this.model.loginUrl}?SAMLRequest=${Utilities.createSamlRequest(this.model.identifier, this.tokenParserService.replyHostProxy) }`;
    else if (this.model.protocol == 'WS-Fed')
      window.location.href = `${this.model.loginUrl}?${Utilities.createWsFedRequest(this.model.identifier, this.tokenParserService.replyHostProxy)}`;
    else
      Utilities.createAuthCodeRequest(this.model.identifier, this.model.scope, this.tokenParserService.replyHost).then((request) => {
        // store paremters in token parser service for processing callback
        this.model.codeVerifier = request.verifier;
        // update request cache for PKCE
        this.tokenParserService.setTokenRequest(this.model);
        window.location.href = `${this.model.loginUrl}?${request.data}`;
      });
  }
  createAuthCodeRequest() {
    throw new Error('Method not implemented.');
  }
}
