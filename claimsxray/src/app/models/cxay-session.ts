import { ParsedToken } from "./parsed-token";
import { TokenRequest } from "./token-request";

export class CxraySession {
    id: string;
    start: Date;
    duration: number;
    request: TokenRequest;
    tokens: ParsedToken[]

    constructor() {
      this.id = '';
      this.start = new Date(0);
      this.duration = 0;
      this.request = new TokenRequest();
      this.tokens = [];
    }
}