package model

import (
  "github.com/stellar/go/xdr"
)

type AccountFlags struct {
	ID            string `json:"id"`
	AuthRequired  bool 	 `json:"authRequired"`
	AuthRevokable bool   `json:"authRevokable"`
	AuthImmutable bool   `json:"authImmutable"`
}

func NewAccountFlagsFromRaw(raw int, id string) AccountFlags {
  f := xdr.AccountFlags(raw)

	return AccountFlags{
    ID: id,
		AuthRequired:  f & xdr.AccountFlagsAuthRequiredFlag != 0,
		AuthRevokable: f & xdr.AccountFlagsAuthRevocableFlag != 0,
		AuthImmutable: f & xdr.AccountFlagsAuthImmutableFlag != 0,
	}
}
