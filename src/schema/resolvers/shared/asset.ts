import { db } from "../../../database";
import { IApolloContext } from "../../../graphql_server";
import { Asset, AssetID } from "../../../model";
import { createBatchResolver, onlyFieldsRequested } from "../util";

export const asset = createBatchResolver<any, Asset[]>((source: any, args: any, ctx: IApolloContext, info: any) => {
  const field = info.fieldName;

  if (onlyFieldsRequested(info, "id", "code", "issuer", "native")) {
    return source.map((obj: any) => {
      if (Array.isArray(obj[field])) {
        return obj[field].map(expandAsset);
      }

      // this trick will return asset id either `obj[field]`
      // is instance of SDK Asset class, either it's already a
      // string asset id
      return expandAsset(obj[field].toString());
    });
  }

  const ids: AssetID[] = source.map((s: any) => s[field].toString());

  return db.assets.findAllByIDs(ids);
});

function expandAsset(assetId: AssetID) {
  if (assetId === "native") {
    return { code: "XLM", issuer: null, native: true };
  }

  const [code, issuer] = assetId.split("-");
  return { id: assetId, code, issuer, native: false };
}
