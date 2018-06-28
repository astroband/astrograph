package model

import "github.com/stellar/go/xdr"

type TrustlineFlags struct {
  ID				 string `json:"id"`
  Authorized bool   `json:"authorized" db:"-"`
}

func NewTrustLineFlagsFromRaw(raw int) TrustlineFlags {
  return TrustlineFlags{
		Authorized: xdr.TrustLineFlags(raw) & xdr.TrustLineFlagsAuthorizedFlag != 0,
	}
}
