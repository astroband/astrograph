import BigNumber from "bignumber.js";

type Bit = 0 | 1;

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

// Implements Horizon's internal mechanism of creating operation ids
// Source: https://github.com/stellar/go/blob/master/services/horizon/internal/toid/main.go
export function buildOperationId(ledgerSeq: number, txIndex: number, opIndex: number): string {
  const result = Buffer.alloc(8);

  const ledgerPart = toBitsArray(ledgerSeq, 32);
  const txPart = toBitsArray(txIndex, 20);
  const opPart = toBitsArray(opIndex, 12);

  opPart.reverse().forEach((bitValue, i) => {
    setBit(result, i, bitValue);
  });

  txPart.reverse().forEach((bitValue, i) => {
    setBit(result, 12 + i, bitValue);
  });

  ledgerPart.reverse().forEach((bitValue, i) => {
    setBit(result, 32 + i, bitValue);
  });

  return new BigNumber(result.toString("hex"), 16).toString();
}

// Sets `bitPosition`-th bit of `buffer` to `value`.
// `bitPosition` is counting from right to left
// Example:
// buffer = 00101001 01011011
// bitPosition = 10
// value = 1
// result = 00101011 01011011
//                ^
//                |
//          value changed here
function setBit(buffer: Buffer, bitPosition: number, value: Bit): void {
  const byteNum = buffer.length - Math.floor(bitPosition / 8) - 1;
  const bitNum = bitPosition % 8;

  if (value === 0) {
    buffer[byteNum] &= ~(1 << bitNum);
  } else {
    buffer[byteNum] |= 1 << bitNum;
  }
}

function toBitsArray(num: number | BigNumber, padding: number = 32): Bit[] {
  return num
    .toString(2)
    .padStart(padding, "0")
    .split("")
    .map(e => parseInt(e, 10)) as Bit[];
}
