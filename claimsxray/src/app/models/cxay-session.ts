import { ParsedToken } from "./parsed-token";

export class CxraySession {
    id: string;
    start: Date;
    duration: number;
    tokens: ParsedToken[]

    constructor() {
      this.id = '';
      this.start = new Date(0);
      this.duration = 0;
      this.tokens = [];
    }
}