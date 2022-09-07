export class TokenRequest {
    protocol: string;
    identifier: string;
    scope: string;
    loginUrl: string;
    tokenUrl: string;
    codeVerifier: string;
    replyHost: string;
    replyPath: string;
  
    constructor() {
      this.protocol = '';
      this.identifier = '';
      this.scope = '';
      this.loginUrl = '';
      this.tokenUrl = '';
      this.codeVerifier = '';
      this.replyHost = '';
      this.replyPath = '';
    }
  }
  