export function buildAssetFilter(code: string | null, issuer?: string | null, predicate?: string) {
  return `
    ${predicate || "asset"} ${code ? `@filter(eq(code, "${code}"))` : ""} {
      ${issuer ? `issuer @filter(eq(account.id, "${issuer}"))` : ""}
    }
  `;
}
