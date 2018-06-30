package model

import "github.com/stellar/go/xdr"

func NewTrustLineFlagsFromRaw(raw int) TrustLineFlags {
  return TrustLineFlags{
		Authorized: xdr.TrustLineFlags(raw) & xdr.TrustLineFlagsAuthorizedFlag != 0,
	}
}
