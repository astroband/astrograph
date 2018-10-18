import { MemoType } from "../util/stellar";

export interface ITransactionData {
  id: string;
  seq: string;
  index: string;
  // body
  "memo.value": string | null;
  "memo.type": MemoType | null;
  fee_amount: string;
  // result
  // meta
  // feeMeta
  "account.source": IAccountData[];
  "time_bounds.min": number;
  "time_bounds.max": number;
}

export interface IAccountData {
  id: string;
  // it's incomplete
}
