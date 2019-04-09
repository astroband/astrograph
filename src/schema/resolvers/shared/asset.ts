import { Asset } from "stellar-sdk";

export function asset(obj: any, args: any, ctx: any, info: any) {
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
