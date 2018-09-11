const ACCOUNT_ID = process.argv[2];
const GRAPHQL_ENDPOINT = process.argv[3] || "http://localhost:4000/graphql";

if (!ACCOUNT_ID) {
  throw("Pass Stellar account public key (G....) as second argument.");
}
