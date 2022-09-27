import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import { ParsedToken } from '../models/parsed-token';
import { TokenType } from '../models/app-enums';
import { TokenRequest } from '../models/token-request';
import { TokenParserService } from '../services/token-parser.service';
import { CxraySessionService } from '../services/cxray-session.service';

@Component({
  selector: 'app-token',
  templateUrl: './token.component.html',
  styleUrls: ['./token.component.css']
})
export class TokenComponent implements OnInit {
  hasSession = false;
  tokens: ParsedToken[] = [];
  tokenRequest: TokenRequest = new TokenRequest();

  constructor(
    private route: ActivatedRoute,
    private tokenParserService: TokenParserService,
    private cxraySessionService: CxraySessionService
  ) { }

  ngOnInit() {

    if (this.cxraySessionService.isStarted()) {
      this.hasSession = this.cxraySessionService.isStarted();
      this.tokens = this.cxraySessionService.getDetails().tokens;
    }
    else {
      this.route.queryParams.subscribe(params => {
        // check for SAML response
        if (params['samlResponse']) {
          this.tokenParserService.addRawToken(TokenType.Saml, params['samlResponse']);
        }
        // check for WS-Fed response
        if (params['wresult']) {
          this.tokenParserService.addRawToken(TokenType.WsFed, params['wresult']);
        }

        this.startSession(this.tokenParserService.tokens);
      });
  
      this.route.fragment.subscribe(fragment => {
        // check for OIDC response
        if (fragment) {
          //console.log(fragment);
          const urlParams = new URLSearchParams(fragment);
          const code = urlParams.get('code')
          if (code) {
            this.tokenRequest = this.tokenParserService.getTokenRequest();
            this.getOidcTokens(code);
          }
        }
      });
    }
  }

  startSession(tokens: ParsedToken[]) {
    this.tokens = tokens;
      // start session if enabled
      if (this.cxraySessionService.isEnabled()) {
        this.cxraySessionService.start(this.tokenParserService.getTokenRequest(), tokens);  
        this.hasSession = true;
      }
  }

  getOidcTokens(code: string) {

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Origin': this.tokenParserService.replyHost
        },
        body: new URLSearchParams({
          'client_id': this.tokenRequest.identifier,
          'code_verifier': this.tokenRequest.codeVerifier,
          'redirect_uri': this.tokenParserService.replyHost,
          'grant_type': 'authorization_code',
          'code': code
        })
      };

    fetch(this.tokenRequest.tokenUrl, options)
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          throw { error: data.error, error_description: data.error_description, trace_id: data.trace_id }
        }
        // console.log(data);
        if (data.id_token)
          this.tokenParserService.addRawToken(TokenType.Id, data.id_token)
        if (data.access_token)
          this.tokenParserService.addRawToken(TokenType.Access, data.access_token)
        
        this.startSession(this.tokenParserService.tokens);
      })
      .catch(error => {
        console.log('Error: ');
        console.log(error);
      });
    }
}
