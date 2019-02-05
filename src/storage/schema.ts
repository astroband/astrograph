// Unfortunately, DGraph schema doesn't support comments,
// so we'll remove them later before exporting, using regex
const schemaWithComments = `
  # common
  order: int @index(int) .
  key: string @index(hash) .

  # ledgers
  ledger.id: int @index(int) .
  version: int .
  base_fee: int .
  base_reserve: int .
  max_tx_set_size: int .
  close_time: dateTime @index(hour) .

  # accounts
  account.id: string @index(exact) .
  deleted: bool @index(bool) .

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
  tx.next: uid @reverse .
  result_code: int .
  fee_amount: int .
  fee_charged: int .
  success: bool @index(bool) .
  time_bounds.min: dateTime .
  time_bounds.max: dateTime .
  memo.type: string .
  memo.value: string .

  # operations
  op.id: string @index(exact) .
  op.transaction: uid @reverse .
  op.index: int .
  op.source: uid @reverse .
  op.destination: uid @reverse .
  op.kind: string @index(hash) .
  amount: int .

  # account merge
  result: uid .
  account_merge_result_code: int .

  # allow trust
  allow_trust_op.trustor: uid @reverse .
  asset_code: string @index(exact) .
  authorize: bool @index(bool) .
  allow_trust_result_code: int .

  # bump sequence
  bump_to: int @index(int) .
  bump_sequence_result_code: int .

  # change trust
  change_trust_op.asset: uid @reverse .
  limit: int @index(int) .
  change_trust_result_code: int .

  # create account
  starting_balance: int @index(int) .
  create_account_result_code: int .

  # manage data
  name: string @index(exact) .
  value: string @index(exact) . 
  manage_data_result_code: int .

  # manage offer
  manage_offer_op.asset_buying: uid @reverse .
  manage_offer_op.asset_selling: uid @reverse .
  price_n: int .
  price_d: int .
  price: float .
  offer_id: string @index (exact) .

  # payment
  payment_op.asset: uid @reverse .
  payment_result_code: int .

  # path payment
  path_payment_op.asset_source: uid @reverse .
  path_payment_op.asset_destination: uid @reverse .
  path_payment_op.assets_path: uid @reverse .
  send_max: int .
  dest_amount: int .
  
  # set options
  set_options_op.signer: uid @reverse .
  set_options_op.inflation_destination: uid .
  clear_flags: int .
  set_flags: int .
  master_weight: int .
  signer: uid .
  home_domain: string .
  thresholds: uid .
  set_options_result_code: int .

  # thresholds
  high: int .
  med: int .
  low: int .

  # signer
  account: uid .
  weight: int .

  # operation results
  # account merge result
  source_account_balance: int .

  # path payment result
  path_payment_result.no_issuer: uid .
  path_payment_result.last: uid .
  destination: uid .
  last.asset: uid .
  path_payment_result.offers: uid .
  asset_sold: uid .
  asset_bought: uid .
  amount_sold: int .
  amount_bought: int .
  seller: uid .
`;

// remove comments
const validDgraphSchema = schemaWithComments.replace(/#.+$/gm, "");

export { validDgraphSchema as SCHEMA };
