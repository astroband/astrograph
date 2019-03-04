import { Asset } from "stellar-sdk";

declare module "stellar-sdk" {
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
