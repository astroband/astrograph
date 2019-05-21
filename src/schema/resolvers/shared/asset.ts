import { db } from "../../../database";
import { IApolloContext } from "../../../graphql_server";
import { Asset, AssetID } from "../../../model";
import { createBatchResolver, onlyFieldsRequested } from "../util";

export const asset = createBatchResolver<any, Asset[]>((source: any, args: any, ctx: IApolloContext, info: any) => {
  const field = info.fieldName;
  // this trick will return asset id either `obj[field]`
  // is instance of SDK Asset class, either it's already a
  // string asset id
  const ids: AssetID[] = source.map((s: any) => s[field].toString());

  if (onlyFieldsRequested(info, ["code", "issuer", "native"])) {
    return ids.map(id => {
      if (id === "native") {
        return { code: "XLM", issuer: null, native: true };
      }

      const [code, issuer] = id.split("-");
      return { code, issuer, native: false };
    });
  }

  return db.assets.findAllByIDs(ids);
});
