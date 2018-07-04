package model

import "github.com/stellar/go/xdr"
import "fmt"

func (tx *Transaction) DecodeRaw() {
  xdr.SafeUnmarshalBase64(tx.RawBody, &tx.Body)
  xdr.SafeUnmarshalBase64(tx.RawResult, &tx.Result)
  xdr.SafeUnmarshalBase64(tx.RawMeta, &tx.Meta)
}

func (tx Transaction) MergingAccountIDs() (id []string) {
  txB := tx.Body.Tx

  for _, op := range txB.Operations {
    if op.Body.Type == xdr.OperationTypeAccountMerge {
      id = append(id, op.Body.Destination.Address())

      n := op.SourceAccount.Address()
      if n != "" {
        id = append(id, n)
      } else {
        n = txB.SourceAccount.Address()
        if n != "" {
          id = append(id, n)
        }
      }
    }
  }

  return
}
