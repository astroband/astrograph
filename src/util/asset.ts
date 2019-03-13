import { Asset } from "stellar-base";

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
