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
  from: (value: string | null) => {
    return value ? new BigNumber(value) : value;
  },
  to: (value: BigNumber | null) => {
    return value ? value.toString() : value;
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
