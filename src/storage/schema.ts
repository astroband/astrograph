// Unfortunately, DGraph schema doesn't support comments,
// so we'll remove them later before exporting, using regex
const schemaWithComments = `
  # common
  order: int @index(int) .
  key: string @index(hash) .
  kind.setOption: string .
  kind.payment: string .
  kind.pathPayment: string .
  kind.manageOffer: string .
  kind.manageDatum: string .
  kind.createAccount: string .
  kind.changeTrust: string .
  kind.allowTrust: string .

  # ledgers
  ledger.id: int @index(int) .
  ledger.prev: uid @reverse .
  version: int .
  base_fee: int .
  base_reserve: int .
  max_tx_set_size: int .
  close_time: datetime @index(hour) .
  _ingested: bool .

  # accounts
  account.id: string @index(exact) .
  account.created_by: uid @reverse .
  account.merged_into: uid @reverse .
  account.inflation_destination: uid @reverse .

  # assets
  asset.id: string @index(exact) .
  asset.issuer: uid @reverse .
  code: string @index(exact) .
  native: bool @index(bool) .

  # transactions
  tx.id: string @index(exact) .
  tx.ledger: uid @reverse .
  tx.source: uid @reverse .
  tx.index: int .
  tx.prev: uid @reverse .
  result_code: int @index(int) .
  fee_amount: int .
  fee_charged: int .
  success: bool @index(bool) .
  time_bounds.min: dateTime .
  time_bounds.max: dateTime .
  memo.type: string .
  memo.value: string .

  # ledger change
  balance: string .

  # operations
  op.id: string @index(exact) .
  op.transaction: uid @reverse .
  op.ledger: uid @reverse .
  op.index: int .
  op.source: uid @reverse .
  op.destination: uid @reverse .
  op.kind: string @index(hash) .
  op.prev: uid @reverse .
  op.result: uid @reverse .
  amount: int .

  # account merge
  account_merge_op.result_code: int .

  # allow trust
  allow_trust_op.trustor: uid @reverse .
  allow_trust_op.result_code: int .
  allow_trust_op.asset: uid @reverse .
  authorize: bool @index(bool) .

  # bump sequence
  bump_sequence_op.result_code: int .
  bump_to: int @index(int) .

  # change trust
  change_trust_op.asset: uid @reverse .
  change_trust_op.result_code: int .
  limit: int @index(int) .

  # create account
  starting_balance: int @index(int) .
  create_account_op.result_code: int .

  # manage data
  manage_data_op.result_code: int .
  name: string @index(exact) .
  value: string @index(exact) . 

  # manage offer
  manage_offer_op.asset_buying: uid @reverse .
  manage_offer_op.asset_selling: uid @reverse .
  manage_offer_op.result_code: int .
  price_n: int .
  price_d: int .
  price: float .
  offer_id: int @index(int) .

  # payment
  payment_op.asset: uid @reverse .
  payment_op.result_code: int .

  # path payment
  path_payment_op.asset_source: uid @reverse .
  path_payment_op.asset_destination: uid @reverse .
  path_payment_op.assets_path: [uid] @reverse .
  path_payment_op.result_code: int .
  send_max: int .
  
  # set options
  set_options_op.signer: uid @reverse .
  set_options_op.inflation_destination: uid @reverse .
  set_options_op.result_code: int .
  set_options_op.signer: uid .
  clear_flags: int .
  set_flags: int .
  master_weight: int .
  home_domain: string .
  thresholds: uid .

  # thresholds
  high: int .
  med: int .
  low: int .

  # signer
  account: uid .
  weight: int .
`;

// remove comments
const validDgraphSchema = schemaWithComments.replace(/#.+$/gm, "");

export { validDgraphSchema as SCHEMA };
