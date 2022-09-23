import { Component, OnInit } from '@angular/core';

import { v4 as uuidv4 } from 'uuid';
import { deflateRaw } from 'pako';

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
    this.model.protocol = 'SAML';
  }

  onSubmit() {
    //enable session
    if (this.model.sessionDuration > 0)
      this.cxraySessionService.enable(this.model.sessionDuration);
    else
      this.cxraySessionService.end();

    // clear cache used for PKCE
    this.tokenParserService.removeTokenRequest();

    if (this.model.protocol == 'SAML')
      window.location.href = this.createSamlRequest();
    else if (this.model.protocol == 'WS-Fed')
      window.location.href = this.createWsFedRequest();
    else
      this.createAuthCodeRequest().then(request => {
        this.tokenParserService.setTokenRequest(this.model);
        window.location.href = request;
      });
  }

  createSamlRequest() {
    this.model.replyPath = 'api/sso' ;
    var id = `id${uuidv4().replace('_','')}`;
    var instant = new Date().toISOString(); //"2013-03-18T03:28:54.1839884Z"
    var reply = this.model.replyHostProxy + this.model.replyPath;
    //var samlXml = `<samlp:AuthnRequest xmlns="urn:oasis:names:tc:SAML:2.0:metadata" ID="${id}" Version="2.0" IssueInstant="${instant}" xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"><Issuer xmlns="urn:oasis:names:tc:SAML:2.0:assertion">${this.model.identifier}</Issuer></samlp:AuthnRequest>`;
    var samlXml = `<samlp:AuthnRequest xmlns="urn:oasis:names:tc:SAML:2.0:metadata" ID="${id}" Version="2.0" IssueInstant="${instant}" xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" AssertionConsumerServiceURL="${reply}"><Issuer xmlns="urn:oasis:names:tc:SAML:2.0:assertion">${this.model.identifier}</Issuer></samlp:AuthnRequest>`;

    // https://jgraph.github.io/drawio-tools/tools/convert.html
    let data = String.fromCharCode.apply(null, Array.from(deflateRaw(samlXml)));
    data = btoa(data);

    return `${this.model.loginUrl}?SAMLRequest=${encodeURIComponent(data) }`;
  }

  createWsFedRequest() {
    this.model.replyPath = 'api/sso' ;
    var reply = this.model.replyHostProxy + this.model.replyPath;
    return `${this.model.loginUrl}?client-request-id=${uuidv4()}&wa=wsignin1.0&wtrealm=${this.model.identifier}&wreply=${reply}`;
  }

  async createAuthCodeRequest() {
    this.model.replyPath = 'token';
    let reply = this.model.replyHost + this.model.replyPath;
    let state = Utilities.getRandomInt(10000, 99999);

    // craft auth code request
    let oidcRequest = `client_id=${this.model.identifier}&response_type=code&redirect_uri=${reply}&response_mode=fragment&scope=${this.model.scope}&state=${state}`;
    // add PKCE
    let codeChallengeMethod = 'S256';
    let codeVerifier = Utilities.base64UrlEncode(Utilities.pkceCodeVerifier());
    let codeChallenge = Utilities.base64UrlEncode(await Utilities.pkceCodeChallenge(codeVerifier));
    oidcRequest += `&code_challenge=${codeChallenge}&code_challenge_method=${codeChallengeMethod}`;

    // store paremters in token parser service for processing callback
    //console.log(codeVerifier);
    this.model.codeVerifier = codeVerifier;
    
    return `${this.model.loginUrl}?${oidcRequest}`;
  }
}
