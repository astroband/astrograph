export interface ITransactionData {
  id: string;
  seq: string;
  index: string;
  // body
  "memo.value": string;
  "memo.type": string;
  fee_amount: string;
  // result
  // meta
  // feeMeta
  "account.source": AccountData[];
  "time_bounds.min": string;
  "time_bounds.max": string;
}

export interface IAccountData {
  id: string;
  // it's incomplete
}
