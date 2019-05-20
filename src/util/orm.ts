import { BigNumber } from "bignumber.js";

export const Base64Transformer = {
  from: (value: string | null) => {
    if (!value) {
      return null;
    }
    return Buffer.from(value, "base64").toString();
  },
  to: (value: string | null) => {
    if (!value) {
      return null;
    }
    return Buffer.from(value).toString("base64");
  }
};

export const BigNumberTransformer = {
  from: (value: string) => {
    return new BigNumber(value);
  },
  to: (value: BigNumber) => {
    return value.toString();
  }
};
