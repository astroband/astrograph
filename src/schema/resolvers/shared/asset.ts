import stellar from "stellar-base";
import { db } from "../../../database";
import { IApolloContext } from "../../../graphql_server";
import { AssetID, IAsset } from "../../../model";
import { AssetFactory } from "../../../model/factories";
import { createBatchResolver, onlyFieldsRequested } from "../util";

export const asset = createBatchResolver<any, IAsset[]>((source: any, args: any, ctx: IApolloContext, info: any) => {
  const field = info.fieldName;

  if (onlyFieldsRequested(info, "id", "code", "issuer", "native")) {
    return source.map((obj: any) => {
      if (Array.isArray(obj[field])) {
        return obj[field].map((asset: AssetID | stellar.Asset) => AssetFactory.fromId(asset.toString()));
      }

      // this trick will return asset id either `obj[field]`
      // is instance of SDK Asset class, either it's already a
      // string asset id
      return AssetFactory.fromId(obj[field].toString());
    });
  }

  const ids: AssetID[] = source.map((s: any) => s[field].toString());

  return db.assets.findAllByIDs(ids);
});
