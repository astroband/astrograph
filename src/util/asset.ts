import { Asset } from "stellar-base";

/* TODO: fix all stellar-base / stellar-sdk + TS hackery */

/* tslint:disable */
declare module "stellar-base" {
  interface Asset {
    toString(): string;
  }
}

Asset.prototype.toString = function() {
  if (this.isNative()) {
    return "native";
  }

  return `${this.getCode()}-${this.getIssuer()}`;
};
