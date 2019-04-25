import { Asset } from "stellar-sdk";
import { db } from "../../../database";
import { IApolloContext } from "../../../graphql_server";
import { AssetID } from "../../../model";
import { createBatchResolver, onlyFieldsRequested } from "../util";

export const asset = createBatchResolver<any, Asset[]>((source: any, args: any, ctx: IApolloContext, info: any) => {
  const field = info.fieldName;

  if (onlyFieldsRequested(info, ["code", "issuer"])) {
    return source.map((obj: any) => {
      if (obj[field] === "native") {
        return { code: "XLM", issuer: null };
      }
      const [code, issuer] = obj[field].split("-");
      return { code, issuer };
    });
  }

  const ids: AssetID[] = source.map((s: any) => s[field]);

  console.log(ids);

  return db.assets.findAllByIDs(ids);
});
