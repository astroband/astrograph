import { BigNumber } from "bignumber.js";
import { ValueTransformer } from "typeorm";

export class Base64Transformer implements ValueTransformer {
  public from(value: string | null) {
    if (!value) {
      return null;
    }
    return Buffer.from(value, "base64").toString();
  }

  public to(value: string | null) {
    if (!value) {
      return null;
    }
    return Buffer.from(value).toString("base64");
  }
}

export class BigNumberTransformer implements ValueTransformer {
  public from(value: string) {
    return new BigNumber(value);
  }

  public to(value: BigNumber) {
    return value.toString();
  }
}
