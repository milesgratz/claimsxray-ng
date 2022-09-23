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
  private session = new CxraySession();

  constructor() {
    //inflate cookie
    let text = localStorage.getItem(this.CXRAY_SESSION);
    if (text) {
      let data = Uint8Array.from([...text].map(letter => letter.charCodeAt(0)));
      let session = inflateRaw( data,  { to: 'string' });

      this.session = JSON.parse(session);
    }    
  }

  getDetails(): CxraySession {
    return this.session;
  }

  enable(duration:number) {
    this.session.id = uuidv4();
    this.session.duration = duration;

    // deflate cookie content
    let data = String.fromCharCode(...deflateRaw(JSON.stringify(this.session)));
    localStorage.setItem(this.CXRAY_SESSION, data);
  }

  isEnabled(): boolean {
    return this.session.id != '';
  }

  start(tokens: ParsedToken[]) {
    if (this.isEnabled()) {
      this.session.start = new Date();
      this.session.tokens =tokens;
    }

    // deflate cookie content
    let data = String.fromCharCode(...deflateRaw(JSON.stringify(this.session)));
    localStorage.setItem(this.CXRAY_SESSION, data);
  }

  isStarted(): boolean {
    return this.session.tokens.length > 0;
  }

  isExpired(): boolean {
    console.log(this.session.start);
    let expire = new Date(this.session.start).getTime() + this.session.duration * 60000;
    return (new Date(expire) <= new Date());
  }

  end() {
    this.session = new CxraySession();
    localStorage.removeItem(this.CXRAY_SESSION);
  }
}
