import stellar from "stellar-base";

export enum MemoType {
  None = "NONE",
  Id = "ID",
  Text = "TEXT",
  Hash = "HASH",
  Return = "RETURN"
}

export class TransactionMemo {
  public value: string | number | null = null;
  public type: MemoType;

  constructor(xdr: any) {
    const memoType = stellar.xdr.MemoType;
    const memoValue = xdr.value();

    switch (xdr.switch()) {
      case memoType.memoNone():
        this.type = MemoType.None;
        break;
      case memoType.memoId():
        this.value = parseInt(memoValue, 10);
        this.type = MemoType.Id;
        break;
      case memoType.memoText():
        this.value = memoValue;
        this.type = MemoType.Text;
        break;
      case memoType.memoHash():
        this.value = memoValue.toString("hex");
        this.type = MemoType.Hash;
        break;
      case memoType.memoReturn():
        this.value = memoValue.toString("hex");
        this.type = MemoType.Return;
        break;
      default:
        throw new Error(`Unknown memo type ${xdr.switch()}!`);
    }
  }
}
