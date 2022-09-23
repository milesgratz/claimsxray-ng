import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import { ParsedToken } from '../models/parsed-token';
import { TokenType } from '../models/app-enums';
import { TokenParserService } from '../services/token-parser.service';
import { TokenRequest } from '../models/token-request';

@Component({
  selector: 'app-token',
  templateUrl: './token.component.html',
  styleUrls: ['./token.component.css']
})
export class TokenComponent implements OnInit {

  tokens: ParsedToken[] = [];
  tokenRequest: TokenRequest = new TokenRequest();

  constructor(
    private route: ActivatedRoute,
    private tokenParserService: TokenParserService
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      // check for SAML response
      if (params['samlResponse']) {
        this.tokenParserService.addRawToken(TokenType.Saml, params['samlResponse']);
      }
      // check for WS-Fed response
      if (params['wresult']) {
        this.tokenParserService.addRawToken(TokenType.WsFed, params['wresult']);
      }
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

    this.tokens = this.tokenParserService.tokens;
    console.log(this.tokens);
  }

  getOidcTokens(code: string) {

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Origin': this.tokenRequest.replyHost
        },
        body: new URLSearchParams({
          'client_id': this.tokenRequest.identifier,
          'code_verifier': this.tokenRequest.codeVerifier,
          'redirect_uri': this.tokenRequest.replyHost + this.tokenRequest.replyPath,
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
      })
      .catch(error => {
        console.log('Error: ');
        console.log(error);
      })
      .finally(() => {
        this.tokenParserService.removeTokenRequest();
      });
    }
}
