import BigNumber from "bignumber.js";

// Parses paging token, returned by Horizon, and returns ledger seq, an index
// of transaction in ledger and an index of operation in transaction
// Source: https://github.com/stellar/go/blob/master/services/horizon/internal/toid/main.go
// Note: this is a hack, because paging token ought to be opaque,
// but for now we ok with it
export function parsePagingToken(token: string) {
  const binaryToken = new BigNumber(token).toString(2).padStart(64, "0");

  return {
    ledgerSeq: parseInt(binaryToken.slice(0, 32), 2),
    txIndex: parseInt(binaryToken.slice(32, 52), 2),
    opIndex: parseInt(binaryToken.slice(52), 2)
  };
}
