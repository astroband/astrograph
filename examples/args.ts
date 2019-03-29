export const ACCOUNT_ID = process.argv[2];
export const GRAPHQL_ENDPOINT = process.argv[3] || "http://localhost:4000/graphql";

if (!ACCOUNT_ID) {
  throw new Error(("Pass Stellar account public key (G....) as second argument."));
}
