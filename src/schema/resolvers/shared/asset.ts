import { Asset } from "stellar-sdk";
import { IApolloContext } from "../../../graphql_server";

export function asset(obj: any, args: any, ctx: IApolloContext, info: any) {
  const field = info.fieldName;
  const value = obj[field] as Asset;

  const res = (a: Asset): any => {
    return { code: a.getCode(), issuer: a.getIssuer(), native: a.isNative() };
  };

  if (Array.isArray(value)) {
    return value.map(a => res(a));
  }

  return res(value);
}
