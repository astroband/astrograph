package model

import "github.com/stellar/go/xdr"

type TrustLineFlags struct {
  ID				 string `json:"id"`
  Authorized bool   `json:"authorized" db:"-"`
}

func NewTrustLineFlagsFromRaw(raw int) TrustLineFlags {
  return TrustLineFlags{
		Authorized: xdr.TrustLineFlags(raw) & xdr.TrustLineFlagsAuthorizedFlag != 0,
	}
}
