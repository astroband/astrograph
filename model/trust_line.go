package model

import (
	"github.com/mobius-network/astrograph/util"
)

func (t *TrustLine) DecodeRaw() {
	t.Balance = float64(t.RawBalance) / BalancePrecision
	t.Limit = float64(t.RawLimit) / BalancePrecision
	t.Flags = NewTrustLineFlagsFromRaw(t.RawFlags)
	t.Asset = NewAssetFromRaw(t.RawAssetCode, t.RawAssetType, t.RawAssetIssuer)
	t.ID = util.SHA1(t.AccountID, t.Asset.ID, "trustline")
}

func (t TrustLine) GetAccountID() string {
	return t.AccountID
}
