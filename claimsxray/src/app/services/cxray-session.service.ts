import { Injectable } from '@angular/core';

import { v4 as uuidv4 } from 'uuid';
import { inflateRaw, deflateRaw } from 'pako';

import { CxraySession } from '../models/cxay-session';
import { ParsedToken } from '../models/parsed-token';

@Injectable({
  providedIn: 'root'
})
export class CxraySessionService {

  private CXRAY_SESSION = 'CXRAY_SESSION';

  constructor() { }

  getDetails(): CxraySession {
    //inflate cookie
    let text = localStorage.getItem(this.CXRAY_SESSION);
    if (text) {
      let data = Uint8Array.from([...text].map(letter => letter.charCodeAt(0)));
      let session = inflateRaw( data,  { to: 'string' });

      return JSON.parse(session);
    }
    else
      return new CxraySession();
  }

  enable(duration:number) {
    let session = new CxraySession();
    session.id = uuidv4()

    // deflate cookie content
    let data = String.fromCharCode(...deflateRaw(JSON.stringify(session)));
    localStorage.setItem(this.CXRAY_SESSION, data);
  }

  isEnabled(): boolean {
    if (localStorage.getItem(this.CXRAY_SESSION))
      return true;
    
    return false;
  }

  start(tokens: ParsedToken[]) {
    let session = this.getDetails();    
    if (session) {
      session.start = new Date();
      session.tokens =tokens;
    }

    // deflate cookie content
    let data = String.fromCharCode(...deflateRaw(JSON.stringify(session)));
    localStorage.setItem(this.CXRAY_SESSION, data);
  }

  end() {
    localStorage.removeItem(this.CXRAY_SESSION);
  }
}
