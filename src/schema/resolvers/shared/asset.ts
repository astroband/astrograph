import { getRepository, In } from "typeorm";
import { IApolloContext } from "../../../graphql_server";
import { AssetID } from "../../../model";
import { Asset } from "../../../orm/entities";
import { createBatchResolver, onlyFieldsRequested } from "../util";

export const asset = createBatchResolver<any, Asset[]>(async (source: any, args: any, ctx: IApolloContext, info: any) => {
  const field = info.fieldName;

  if (onlyFieldsRequested(info, "id", "code", "issuer", "native")) {
    return source.map((obj: any) => {
      if (Array.isArray(obj[field])) {
        return obj[field].map((a: any) => expandAsset(a.toString()));
      }

      // this trick will return asset id either `obj[field]`
      // is instance of SDK Asset class, either it's already a
      // string asset id
      return expandAsset(obj[field].toString());
    });
  }

  const ids: AssetID[] = source.map((s: any) => s[field].toString());

  const assets = await getRepository(Asset).find({ id: In(ids) });

  return ids.map(id => assets.find(a => a.id === id) || null);
});

function expandAsset(assetId: AssetID) {
  if (assetId === "native") {
    return { id: "native", code: "XLM", issuer: null, native: true };
  }

  const [code, issuer] = assetId.split("-");
  return { id: assetId, code, issuer, native: false };
}
