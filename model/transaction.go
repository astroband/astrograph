package model

import "github.com/stellar/go/xdr"

func (tx *Transaction) DecodeRaw() {
  xdr.SafeUnmarshalBase64(tx.RawBody, &tx.Body)
  xdr.SafeUnmarshalBase64(tx.RawResult, &tx.Result)
  xdr.SafeUnmarshalBase64(tx.RawMeta, &tx.Meta)
}
