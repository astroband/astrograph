// Unfortunately, DGraph schema doesn't support comments,
// so we'll remove them later before exporting, using regex
const schemaWithComments = `
  # common
  order: int @index(int) .
  key: string @index(hash) .
  id: string @index(exact) .
  type: string @index(hash) .
  type.account: default .
  type.asset: default .
  type.ledger: default .
  type.operation: default .
  type.transaction: default .
  type.trust_line_entry: default .
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
  index: int @index(int) .
  account.source: uid .
  ledger: uid .
  next: uid .
  prev: uid .
  asset: uid .

  # ledgers
  seq: int @index(int) .
  version: default .
  base_fee: default .
  base_reserve: default .
  max_tx_set_size: default .
  close_time: datetime @index(hour) .
  _ingested: default .

  # accounts
  deleted: bool @index(bool) .
  assets.issued: uid .
  operations: uid .
  transactions: uid .

  # assets
  asset.id: default .
  issuer: uid .
  code: string @index(exact) .
  native: bool @index(bool) .

  # transactions
  result_code: default .
  fee_amount: default .
  fee_charged: default .
  success: default .
  time_bounds.min: default .
  time_bounds.max: default .
  memo.type: default .
  memo.value: default .

  # trustline entry
  balance: default .

  # operations
  transaction: uid .
  kind: string @index(hash) .
  amount: int @index(int) .
  account.destination: uid .
  result: uid .

  # account merge
  account_merge_result_code: default .

  # allow trust
  trustor: uid .
  asset_code: string @index(exact) .
  authorize: bool @index(bool) .
  allow_trust_result_code: default .

  # bump sequence
  bump_to: int @index(int) .

  # change trust
  limit: int @index(int) .
  change_trust_result_code: default .

  # create account
  starting_balance: int @index(int) .
  create_account_result_code: default .

  # manage data
  name: string @index(exact) .
  value: string @index(exact) .
  manage_data_result_code: default .

  # manage offer
  asset.buying: uid .
  asset.selling: uid .
  price_n: default .
  price_d: default .
  price: float @index(float) .
  offer_id: string @index(exact) .

  # payment
  payment_result_code: default .

  # path payment
  asset.source: uid .
  asset.destination: uid .
  assets.path: uid .
  send_max: default .
  dest_amount: default .
  path_payment_result_code: default .

  # set options
  signer: uid .
  account.inflation_dest: uid .
  clear_flags: default .
  set_flags: default .
  master_weight: default .
  home_domain: default .
  thresholds: uid .
  set_options_result_code: default .

  # thresholds
  low: default .
  med: default .
  high: default .

  # signer
  account: uid .
  weight: default .

  # operation results
  # account merge result
  source_account_balance: int .

  # path payment result
  no_issuer: uid .
  last: uid .
  offers: uid .
  asset.sold: uid .
  asset.bought: uid .
  amount_sold: default .
  amount_bought: default .
  seller: uid .
`;

// remove comments
const validDgraphSchema = schemaWithComments.replace(/#.+$/gm, "");

export { validDgraphSchema as SCHEMA };
