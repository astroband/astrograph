// Unfortunately, DGraph schema doesn't support comments,
// so we'll remove them later before exporting, using regex
const schemaWithComments = `
  _ingested: default .
  account: uid .
  account.destination: uid .
  account.inflation_dest: uid .
  account.source: uid .
  account_merge_result_code: default .
  allow_trust_result_code: default .
  amount: int @index(int) .
  amount_bought: default .
  amount_sold: default .
  asset: uid .
  asset.bought: uid .
  asset.buying: uid .
  asset.destination: uid .
  asset.id: default .
  asset.selling: uid .
  asset.sold: uid .
  asset.source: uid .
  asset_code: string @index(exact) .
  assets.issued: uid .
  assets.path: uid .
  authorize: bool @index(bool) .
  balance: default .
  base_fee: default .
  base_reserve: default .
  bump_to: int @index(int) .
  change_trust_result_code: default .
  clear_flags: default .
  close_time: datetime @index(hour) .
  code: string @index(exact) .
  create_account_result_code: default .
  deleted: bool @index(bool) .
  dest_amount: default .
  dgraph.group.acl: string .
  dgraph.password: password .
  dgraph.user.group: uid .
  dgraph.xid: string @index(exact) .
  fee_amount: default .
  fee_charged: default .
  high: default .
  home_domain: default .
  id: string @index(exact) .
  index: int @index(int) .
  issuer: uid .
  key: string @index(hash) .
  kind: string @index(hash) .
  kind.accountMerge: default .
  kind.allowTrust: default .
  kind.changeTrust: default .
  kind.createAccount: default .
  kind.createPassiveOffer: default .
  kind.inflation: default .
  kind.manageDatum: default .
  kind.manageOffer: default .
  kind.pathPayment: default .
  kind.payment: default .
  kind.setOption: default .
  last: uid .
  ledger: uid .
  limit: int @index(int) .
  low: default .
  manage_data_result_code: default .
  master_weight: default .
  max_tx_set_size: default .
  med: default .
  memo.type: default .
  memo.value: default .
  name: string @index(exact) .
  native: bool @index(bool) .
  next: uid .
  offer_id: string @index(exact) .
  offers: uid .
  operations: uid .
  order: int @index(int) .
  path_payment_result_code: default .
  payment_result_code: default .
  prev: uid .
  price: float @index(float) .
  price_d: default .
  price_n: default .
  result: uid .
  result_code: default .
  seller: uid .
  send_max: default .
  seq: int @index(int) .
  set_flags: default .
  set_options_result_code: default .
  signer: uid .
  source_account_balance: default .
  starting_balance: int @index(int) .
  success: default .
  thresholds: uid .
  time_bounds.max: default .
  time_bounds.min: default .
  transaction: uid .
  transactions: uid .
  trustor: uid .
  type: string @index(hash) .
  type.account: default .
  type.asset: default .
  type.ledger: default .
  type.operation: default .
  type.transaction: default .
  type.trust_line_entry: default .
  value: string @index(exact) .
  version: default .
  weight: default .
`;

// remove comments
const validDgraphSchema = schemaWithComments.replace(/#.+$/gm, "");

export { validDgraphSchema as SCHEMA };
