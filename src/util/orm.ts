import { BigNumber } from "bignumber.js";
import { xdr } from "stellar-base";
import { AssetID } from "../model";
import { AssetFactory } from "../model/factories";

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

export const AssetTransformer = {
  from: (value: string) => {
    return AssetFactory.fromXDR(value).toString();
  },
  to: (value: AssetID) => {
    const assetXDRObject = AssetFactory.fromId(value).toXDRObject();
    return xdr.Asset.toXDR(assetXDRObject).toString("base64");
  }
};

export const DateTransformer = {
  from: (value: number) => {
    return new Date(value * 1000);
  },
  to: (value: Date) => {
    return Math.round(value.getTime() / 1000);
  }
};
