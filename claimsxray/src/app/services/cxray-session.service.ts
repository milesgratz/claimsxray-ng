import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

import { v4 as uuidv4 } from 'uuid';
import { inflateRaw, deflateRaw } from 'pako';

import { CxraySession } from '../models/cxay-session';
import { ParsedToken } from '../models/parsed-token';
import { TokenRequest } from '../models/token-request';
import { SessionState } from '../models/session-state';

@Injectable({
  providedIn: 'root'
})
export class CxraySessionService {

  private CXRAY_SESSION = 'CXRAY_SESSION';
  private session = new CxraySession();

  private state$:BehaviorSubject<SessionState> = new BehaviorSubject<SessionState>({ started: false, token: false, accessToken: false });

  constructor() {
    //inflate cookie
    let text = localStorage.getItem(this.CXRAY_SESSION);
    if (text) {
      let data = Uint8Array.from([...text].map(letter => letter.charCodeAt(0)));
      let session = inflateRaw( data,  { to: 'string' });

      this.session = JSON.parse(session);
      this.state$.next({ started: true, token: this.session.tokens.length > 0, accessToken: this.session.tokens.length > 1 });
    }    
  }

  get started() {
    return this.state$.asObservable();
  }

  getDetails(): CxraySession {
    return this.session;
  }

  enable(duration:number) {
    let id = this.session.id == '' ? uuidv4() : this.session.id;
    this.session = new CxraySession();
    this.session.id = id;
    this.session.duration = duration;

    // deflate cookie content
    let data = String.fromCharCode(...deflateRaw(JSON.stringify(this.session)));
    localStorage.setItem(this.CXRAY_SESSION, data);
  }

  isEnabled(): boolean {
    return this.session.id != '';
  }

  start(request:TokenRequest, tokens: ParsedToken[]) {
    if (this.isEnabled()) {
      this.session.start = new Date();
      this.session.request =request;
      this.session.tokens =tokens;
    }

    // deflate cookie content
    let data = String.fromCharCode(...deflateRaw(JSON.stringify(this.session)));
    localStorage.setItem(this.CXRAY_SESSION, data);

    this.state$.next({ started: true, token: tokens.length > 0, accessToken: tokens.length > 1 });
  }

  isExpired(): boolean {
    if (this.state$.getValue().started) {
      let expire = new Date(this.session.start).getTime() + this.session.duration * 60000;
      return (new Date(expire) <= new Date());
    }
    else
      return true;
  }

  end() {
    this.session = new CxraySession();
    localStorage.removeItem(this.CXRAY_SESSION);
    this.state$.next({ started: false, token: false, accessToken: false });
  }
}
