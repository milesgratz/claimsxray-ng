import { Claim } from './claim';
import { TokenType } from './app-enums';

export interface ParsedToken {
  type: TokenType;
  issuer: string;
  audience: string;
  validFrom: Date;
  validTo: Date;
  claims: Claim[];
  rawToken: string[];
}
