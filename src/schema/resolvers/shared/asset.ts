import { db } from "../../../database";
import { IApolloContext } from "../../../graphql_server";
import { Asset, AssetID } from "../../../model";
import { createBatchResolver, onlyFieldsRequested } from "../util";

export const asset = createBatchResolver<any, Asset[]>((source: any, args: any, ctx: IApolloContext, info: any) => {
  const field = info.fieldName;

  if (onlyFieldsRequested(info, ["code", "issuer", "native"])) {
    return source.map((obj: any) => {
      // this trick will return asset id either `obj[field]`
      // is instance of SDK Asset class, either it's already a
      // string asset id
      const assetId = obj[field].toString();

      if (assetId === "native") {
        return { code: "XLM", issuer: null, native: true };
      }

      const [code, issuer] = assetId.split("-");
      return { code, issuer, native: false };
    });
  }

  const ids: AssetID[] = source.map((s: any) => s[field].toString());

  return db.assets.findAllByIDs(ids);
});
