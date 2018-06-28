package model

import "github.com/stellar/go/xdr"

type TrustlineFlags struct {
  ID				 string `json:"id"`
  Authorized bool   `json:"authorized" db:"-"`
}

func NewTrustLineFlags(f int) TrustlineFlags {
  return TrustlineFlags{
		Authorized: xdr.TrustLineFlags(f) & xdr.TrustLineFlagsAuthorizedFlag != 0,
	}
}
