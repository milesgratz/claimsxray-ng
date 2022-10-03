import { v4 as uuidv4 } from 'uuid';
import { deflateRaw } from 'pako';

export class Utilities {

  static createSamlRequest(identifier:string, proxy: string):string {
    let id = `id${uuidv4().replace('_','')}`;
    let instant = new Date().toISOString(); //"2013-03-18T03:28:54.1839884Z"
    //let samlXml = `<samlp:AuthnRequest xmlns="urn:oasis:names:tc:SAML:2.0:metadata" ID="${id}" Version="2.0" IssueInstant="${instant}" xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"><Issuer xmlns="urn:oasis:names:tc:SAML:2.0:assertion">${this.model.identifier}</Issuer></samlp:AuthnRequest>`;
    let samlXml = `<samlp:AuthnRequest xmlns="urn:oasis:names:tc:SAML:2.0:metadata" ID="${id}" Version="2.0" IssueInstant="${instant}" xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" AssertionConsumerServiceURL="${proxy}"><Issuer xmlns="urn:oasis:names:tc:SAML:2.0:assertion">${identifier}</Issuer></samlp:AuthnRequest>`;

    // https://jgraph.github.io/drawio-tools/tools/convert.html
    let data = String.fromCharCode.apply(null, Array.from(deflateRaw(samlXml)));
    data = btoa(data);

    //return `${this.model.loginUrl}?SAMLRequest=${encodeURIComponent(data) }`;
    return encodeURIComponent(data);
  }

  static createWsFedRequest(identifier:string, proxy: string):string {
    //return `${this.model.loginUrl}?client-request-id=${uuidv4()}&wa=wsignin1.0&wtrealm=${identifier}&wreply=${reply}`;
    return `client-request-id=${uuidv4()}&wa=wsignin1.0&wtrealm=${identifier}&wreply=${proxy}`;
  }

  static async createAuthCodeRequest(clientid:string, scope:string, reply: string):Promise<{verifier: string, data: string}> {
    let state = Utilities.getRandomInt(10000, 99999);

    // craft auth code request
    let oidcRequest = `client_id=${clientid}&response_type=code&redirect_uri=${reply}&response_mode=fragment&scope=${scope}&state=${state}`;
    // add PKCE
    let codeChallengeMethod = 'S256';
    let codeVerifier = Utilities.base64UrlEncode(Utilities.pkceCodeVerifier());
    let codeChallenge = Utilities.base64UrlEncode(await Utilities.pkceCodeChallenge(codeVerifier));
    oidcRequest += `&code_challenge=${codeChallenge}&code_challenge_method=${codeChallengeMethod}`;

    //console.log(codeVerifier);
    return {verifier: codeVerifier, data: oidcRequest};
  }

  
  static getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
  }

  static base64UrlEncode(data: Uint8Array) {
    let s = Utilities.base64EncArr(data);
    s = s.split('=')[0].replace(/\+/g, '-').replace(/\//g, '_');
    return s;
  }

  static base64UrlDecode(text: string) {
    let encodedString = text.replace(/-/g, "+").replace(/_/g, "/");
    switch (encodedString.length % 4) {
        case 0:
            break;
        case 2:
            encodedString += "==";
            break;
        case 3:
            encodedString += "=";
            break;
        default:
            throw new Error("Invalid base64 string");
    }

    return this.base64DecToArr(encodedString);
  }

  static pkceCodeVerifier() {
    var verifier = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      verifier[i] = Utilities.getRandomInt(1, 255);
    }
    return verifier;
  }

  static async pkceCodeChallenge(verifier: string) {
    const data = Utilities.stringToUtf8Arr(verifier);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return new Uint8Array(hashBuffer);
  } 

  static base64EncArr(aBytes: Uint8Array): string {
    const eqLen = (3 - (aBytes.length % 3)) % 3;
    let sB64Enc = "";

    for (let nMod3, nLen = aBytes.length, nUint24 = 0, nIdx = 0; nIdx < nLen; nIdx++) {
      nMod3 = nIdx % 3;
      /* Uncomment the following line in order to split the output in lines 76-character long: */
      /*
        *if (nIdx > 0 && (nIdx * 4 / 3) % 76 === 0) { sB64Enc += "\r\n"; }
        */
      nUint24 |= aBytes[nIdx] << (16 >>> nMod3 & 24);
      if (nMod3 === 2 || aBytes.length - nIdx === 1) {
        sB64Enc += String.fromCharCode(
          Utilities.uint6ToB64(nUint24 >>> 18 & 63),
          Utilities.uint6ToB64(nUint24 >>> 12 & 63),
          Utilities.uint6ToB64(nUint24 >>> 6 & 63),
          Utilities.uint6ToB64(nUint24 & 63)
        );
        nUint24 = 0;
      }
    }

    return eqLen === 0 ? sB64Enc : sB64Enc.substring(0, sB64Enc.length - eqLen) + (eqLen === 1 ? "=" : "==");
  }
  
  static uint6ToB64(nUint6: number): number {
    return nUint6 < 26 ?
      nUint6 + 65
      : nUint6 < 52 ?
        nUint6 + 71
        : nUint6 < 62 ?
          nUint6 - 4
          : nUint6 === 62 ?
            43
            : nUint6 === 63 ?
              47
              :
              65;
  }

  static stringToUtf8Arr(sDOMStr: string): Uint8Array {
    let nChr;
    let nArrLen = 0;
    const nStrLen = sDOMStr.length;
    /* mapping... */
    for (let nMapIdx = 0; nMapIdx < nStrLen; nMapIdx++) {
      nChr = sDOMStr.charCodeAt(nMapIdx);
      nArrLen += nChr < 0x80 ? 1 : nChr < 0x800 ? 2 : nChr < 0x10000 ? 3 : nChr < 0x200000 ? 4 : nChr < 0x4000000 ? 5 : 6;
    }

    const aBytes = new Uint8Array(nArrLen);

    /* transcription... */

    for (let nIdx = 0, nChrIdx = 0; nIdx < nArrLen; nChrIdx++) {
      nChr = sDOMStr.charCodeAt(nChrIdx);
      if (nChr < 128) {
        /* one byte */
        aBytes[nIdx++] = nChr;
      } else if (nChr < 0x800) {
        /* two bytes */
        aBytes[nIdx++] = 192 + (nChr >>> 6);
        aBytes[nIdx++] = 128 + (nChr & 63);
      } else if (nChr < 0x10000) {
        /* three bytes */
        aBytes[nIdx++] = 224 + (nChr >>> 12);
        aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
        aBytes[nIdx++] = 128 + (nChr & 63);
      } else if (nChr < 0x200000) {
        /* four bytes */
        aBytes[nIdx++] = 240 + (nChr >>> 18);
        aBytes[nIdx++] = 128 + (nChr >>> 12 & 63);
        aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
        aBytes[nIdx++] = 128 + (nChr & 63);
      } else if (nChr < 0x4000000) {
        /* five bytes */
        aBytes[nIdx++] = 248 + (nChr >>> 24);
        aBytes[nIdx++] = 128 + (nChr >>> 18 & 63);
        aBytes[nIdx++] = 128 + (nChr >>> 12 & 63);
        aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
        aBytes[nIdx++] = 128 + (nChr & 63);
      } else /* if (nChr <= 0x7fffffff) */ {
        /* six bytes */
        aBytes[nIdx++] = 252 + (nChr >>> 30);
        aBytes[nIdx++] = 128 + (nChr >>> 24 & 63);
        aBytes[nIdx++] = 128 + (nChr >>> 18 & 63);
        aBytes[nIdx++] = 128 + (nChr >>> 12 & 63);
        aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
        aBytes[nIdx++] = 128 + (nChr & 63);
      }
    }

    return aBytes;
  }

  static utf8ArrToString (aBytes: Uint8Array): string {
    let sView = "";
    for (let nPart, nLen = aBytes.length, nIdx = 0; nIdx < nLen; nIdx++) {
        nPart = aBytes[nIdx];
        sView += String.fromCharCode(
            nPart > 251 && nPart < 254 && nIdx + 5 < nLen ? /* six bytes */
                /* (nPart - 252 << 30) may be not so safe in ECMAScript! So...: */
                (nPart - 252) * 1073741824 + (aBytes[++nIdx] - 128 << 24) + (aBytes[++nIdx] - 128 << 18) + (aBytes[++nIdx] - 128 << 12) + (aBytes[++nIdx] - 128 << 6) + aBytes[++nIdx] - 128
                : nPart > 247 && nPart < 252 && nIdx + 4 < nLen ? /* five bytes */
                    (nPart - 248 << 24) + (aBytes[++nIdx] - 128 << 18) + (aBytes[++nIdx] - 128 << 12) + (aBytes[++nIdx] - 128 << 6) + aBytes[++nIdx] - 128
                    : nPart > 239 && nPart < 248 && nIdx + 3 < nLen ? /* four bytes */
                        (nPart - 240 << 18) + (aBytes[++nIdx] - 128 << 12) + (aBytes[++nIdx] - 128 << 6) + aBytes[++nIdx] - 128
                        : nPart > 223 && nPart < 240 && nIdx + 2 < nLen ? /* three bytes */
                            (nPart - 224 << 12) + (aBytes[++nIdx] - 128 << 6) + aBytes[++nIdx] - 128
                            : nPart > 191 && nPart < 224 && nIdx + 1 < nLen ? /* two bytes */
                                (nPart - 192 << 6) + aBytes[++nIdx] - 128
                                : /* nPart < 127 ? */ /* one byte */
                                nPart
        );
    }
    return sView;
  }

  static base64DecToArr(base64String: string, nBlockSize?: number): Uint8Array {
      const sB64Enc = base64String.replace(/[^A-Za-z0-9\+\/]/g, "");
      const nInLen = sB64Enc.length;
      const nOutLen = nBlockSize ? Math.ceil((nInLen * 3 + 1 >>> 2) / nBlockSize) * nBlockSize : nInLen * 3 + 1 >>> 2;
      const aBytes = new Uint8Array(nOutLen);

      for (let nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0; nInIdx < nInLen; nInIdx++) {
          nMod4 = nInIdx & 3;
          nUint24 |= this.b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << 18 - 6 * nMod4;
          if (nMod4 === 3 || nInLen - nInIdx === 1) {
              for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++) {
                  aBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255;
              }
              nUint24 = 0;
          }
      }

      return aBytes;
  }


  static b64ToUint6(charNum: number): number {
    return charNum > 64 && charNum < 91 ?
        charNum - 65
        : charNum > 96 && charNum < 123 ? 
            charNum - 71
            : charNum > 47 && charNum < 58 ?
                charNum + 4
                : charNum === 43 ?
                    62
                    : charNum === 47 ?
                        63
                        :
                        0;
  }
}