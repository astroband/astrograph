import { Asset } from "stellar-base";

/* TODO: fix all stellar-base / stellar-sdk + TS hackery */

/* tslint:disable */
declare module "stellar-base" {
  interface Asset {
    isNative(): boolean;
    getIssuer(): string;
    getCode(): string;
    toString(): string;
  }
}

Asset.prototype.toString = function() {
  if (this.isNative()) {
    return "native";
  }

  return `${this.getCode()}-${this.getIssuer()}`;
};
