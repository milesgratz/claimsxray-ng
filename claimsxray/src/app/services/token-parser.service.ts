import { Injectable, Inject } from '@angular/core';

import * as xml2js from 'xml2js';
import { TokenType } from '../models/app-enums';
import { Claim } from '../models/claim';

import { ParsedToken } from '../models/parsed-token';
import { TokenRequest } from '../models/token-request';

@Injectable({
  providedIn: 'root'
})
export class TokenParserService {

  tokens: ParsedToken[] = [];
  replyHost: string = '';
  replyHostProxy: string = '';

  constructor() {
    this.replyHost = `${window.location.origin}/token`;
    this.replyHostProxy = 'http://localhost:7071/api/sso';
  }

  addRawToken(type: TokenType, token: string) {

    let rawToken: string[] = [];
    if (type == TokenType.Saml)
      rawToken.push(this.prettifyXml(atob(token)));
    else if (type == TokenType.WsFed)
      rawToken.push(this.prettifyXml(token));
    else {
      let jwtTokenSplit = token.split('.');
      rawToken.push(this.prettifyJson(this.base64UrlDecode(jwtTokenSplit[0])));
      rawToken.push(this.prettifyJson(this.base64UrlDecode(jwtTokenSplit[1])));
      rawToken.push(jwtTokenSplit[2]);
    }

    this.tokens.push({
      type: type,
      issuer: '',
      audience: '',
      validFrom: new Date(0),
      validTo: new Date(0),
      claims: [],
      rawToken: rawToken
    });

    this.parseTokens();
  }

  clearToken() {
    this.tokens = [];
  }

  parseTokens() {

    this.tokens.forEach(value => {

      // SAML token
      if (value.type == TokenType.Saml) {
        // convert raw token to JSON
        const parser = new xml2js.Parser({ strict: false, trim: true });
        parser.parseString(value.rawToken, (err, result) => {
          if (!err) {
            //console.log(result);
            // parse issuer
            value.issuer = result['SAMLP:RESPONSE'].ISSUER[0]['_'];

            // parse conditions
            value.audience = result['SAMLP:RESPONSE'].ASSERTION[0].CONDITIONS[0].AUDIENCERESTRICTION[0].AUDIENCE[0];
            value.validFrom = new Date(result['SAMLP:RESPONSE'].ASSERTION[0].CONDITIONS[0].$.NOTBEFORE);
            value.validTo = new Date(result['SAMLP:RESPONSE'].ASSERTION[0].CONDITIONS[0].$.NOTONORAFTER);

            // parse claims
            result['SAMLP:RESPONSE'].ASSERTION[0].ATTRIBUTESTATEMENT[0].ATTRIBUTE.forEach((attr: any) => {
              let claim: Claim = {
                type: attr.$.NAME,
                value: attr.ATTRIBUTEVALUE[0]
              };
              value.claims.push(claim);
            });
          }
          else {
            console.log(err);
          }
        });
      }
      // WS-Fed token
      else if (value.type == TokenType.WsFed) {
        // convert raw token to JSON
        const parser = new xml2js.Parser({ strict: false, trim: true });
        parser.parseString(value.rawToken, (err, result) => {
          if (!err) {
            //console.log(result);
            // parse issuer
            value.issuer = result['T:REQUESTSECURITYTOKENRESPONSE']['T:REQUESTEDSECURITYTOKEN'][0].ASSERTION[0].ISSUER[0];

            // parse conditions
            value.audience = result['T:REQUESTSECURITYTOKENRESPONSE']['T:REQUESTEDSECURITYTOKEN'][0].ASSERTION[0].CONDITIONS[0].AUDIENCERESTRICTION[0].AUDIENCE[0];
            value.validFrom = new Date(result['T:REQUESTSECURITYTOKENRESPONSE']['T:REQUESTEDSECURITYTOKEN'][0].ASSERTION[0].CONDITIONS[0].$.NOTBEFORE);
            value.validTo = new Date(result['T:REQUESTSECURITYTOKENRESPONSE']['T:REQUESTEDSECURITYTOKEN'][0].ASSERTION[0].CONDITIONS[0].$.NOTONORAFTER);

            // parse claims
            result['T:REQUESTSECURITYTOKENRESPONSE']['T:REQUESTEDSECURITYTOKEN'][0].ASSERTION[0].ATTRIBUTESTATEMENT[0].ATTRIBUTE.forEach((attr: any) => {
              let claim: Claim = {
                type: attr.$.NAME,
                value: attr.ATTRIBUTEVALUE[0]
              };
              value.claims.push(claim);
            });
          }
          else {
            console.log(err);
          }
        });
      }
      // OIDC/OAuth2 tokens
      else {//if (value.type == TokenType.Id) {
        let payload = JSON.parse(value.rawToken[1]);

        // issuer
        value.issuer = payload.iss;

        // conditions
        value.audience = payload.aud;
        value.validFrom = new Date(payload.nbf * 1000);
        value.validTo = new Date(payload.exp * 1000);

        // claims
        Object.keys(payload).forEach(key => {
          let claim: Claim = {
            type: key,
            value: payload[key]
          };
          value.claims.push(claim);
        });

      }
    });
  }


  getTokenRequest(): TokenRequest {
    let request = sessionStorage.getItem('lastTokenRequest');
    if (request)
      return JSON.parse(request);

    let empty = new TokenRequest();
    //empty.replyHost = this.replyHost;
    //empty.replyHostProxy = this.replyHostProxy;
    return empty;
  }
  setTokenRequest(request: TokenRequest) {
    sessionStorage.setItem('lastTokenRequest', JSON.stringify(request));
  }
  removeTokenRequest() {
    sessionStorage.removeItem('lastTokenRequest');
  }

  base64UrlDecode(data: string) {
    let s = data.replace(/\-/g, '+').replace(/\_/g, '/');
    //s = s.split('=')[0].replace(/\+/g, '-').replace(/\//g, '_');
    return atob(s);
  }

  prettifyXml(text: string, tab: string = '\t') {
    var formatted = '', indent= '';
    text.split(/>\s*</).forEach(function(node) {
        if (node.match( /^\/\w/ )) indent = indent.substring(tab.length); // decrease indent by one 'tab'
        formatted += indent + '<' + node + '>\r\n';
        if (node.match( /^<?\w[^>]*[^\/]$/ )) indent += tab;              // increase indent
    });
    return formatted.substring(1, formatted.length-3);
  }

  prettifyJson(text: string, tab: string = '\t') {
    var jsonobj = JSON.parse(text);
    return JSON.stringify(jsonobj,null,'\t')
  }
}
