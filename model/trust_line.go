package model

import (
	"github.com/mobius-network/astrograph/util"
)

type TrustLine struct {
	ID           string         `json:"id"`
	AccountID    string         `json:"accountId" db:"accountid"`
	Asset        Asset          `json:"asset"`
	Limit        float64        `json:"limit" db:"-"`
	Balance      float64        `json:"balance" db:"-"`
	Flags        TrustLineFlags `json:"flags" db:"-"`
	LastModified int            `json:"lastModified" db:"lastmodified"`

	RawLimit       int    `db:"tlimit"`
	RawBalance     int    `db:"balance"`
	RawFlags       int    `db:"flags"`
	RawAssetType   int    `db:"assettype"`
	RawAssetCode   string `db:"assetcode"`
	RawAssetIssuer string `db:"issuer"`
}

func (t *TrustLine) DecodeRaw() {
	t.Balance = float64(t.RawBalance) / BalancePrecision
	t.Limit = float64(t.RawLimit) / BalancePrecision
	t.Flags = NewTrustLineFlagsFromRaw(t.RawFlags)
	t.Asset = NewAssetFromRaw(t.RawAssetCode, t.RawAssetType, t.RawAssetIssuer)
	t.ID = util.SHA1(t.AccountID, t.Asset.ID, "trustline")
}
