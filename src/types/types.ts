import { Request, Response } from "express";

export interface Me {
  id: number;
  permissions?: string[];
}

export interface DecodedIdToken {
  iss: string; // Issuer
  nbf: number; // Not Before time (Unix timestamp)
  aud: string; // Audience
  sub: string; // Subject identifier
  hd: string; // Hosted domain
  email: string; // Email address
  email_verified: boolean; // Email verification status
  azp: string; // Authorized party
  name: string; // Full name
  given_name: string; // Given name
  family_name: string; // Family name
  iat: number; // Issued At time (Unix timestamp)
  exp: number; // Expiration time (Unix timestamp)
  jti: string; // JWT ID
}

export interface TRequest<T = any> extends Request {
  me?: Me;
  dto?: T;
  files: any;
  t: (key: string, opts?: any) => string;
  pager: {
    page: number;
    limit: number;
  };
}

export interface TResponse extends Response {}

export enum EStatus {
  Active = "Active",
  Inactive = "Inactive",
}

export enum EStatusYN {
  Yes = "Yes",
  No = "No",
}

export enum Roles {}

export enum Category {
  MOBILE = "Mobile",
  COMPUTER = "Computer",
  BOOKS = "Books",
  CAR = "Car",
  GROCERY = "Grocery",
}