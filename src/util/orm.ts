import { BigNumber } from "bignumber.js";
import { xdr } from "stellar-base";

import { AssetID } from "../model";
import { AssetFactory } from "../model/factories";

export const Base64Transformer = {
  from: (value: string | null) => {
    return value ? Buffer.from(value, "base64").toString() : null;
  },
  to: (value: string | null) => {
    return value ? Buffer.from(value).toString("base64") : null;
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
    return AssetFactory.fromId(value)
      .toXDRObject()
      .toXDR("base64");
  }
};

export const TrustLineEntryTransformer = {
  from: (value: string) => {
    const entry = xdr.LedgerEntry.fromXDR(value, "base64").data().value();
    return entry instanceof xdr.TrustLineEntry ? entry : null;
  },
  to: (value: xdr.TrustLineEntry) => {
    return value.toXDR("base64");
  }
};
