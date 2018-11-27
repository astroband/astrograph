export function buildAssetFilter(code: string | null, issuer?: string | null) {
  return `
    asset ${code ? `@filter(eq(code, "${code}"))` : ""} {
      ${issuer ? `issuer @filter(eq(id, "${issuer}"))` : ""}
    }
  `;
}
