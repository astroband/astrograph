package model

type Trustline struct {
	ID           string         `json:"id"`
	AccountID    string         `json:"accountId" db:"accountid"`
	AssetType    AssetType      `json:"assetType" db:"-"`
	Issuer       string         `json:"issuer" db:"issuer"`
	AssetCode    string         `json:"assetCode" db:"assetcode"`
	Limit        float64        `json:"limit" db:"-"`
	Balance      float64        `json:"balance" db:"-"`
	Flags        TrustlineFlags `json:"flags" db:"-"`
	LastModified int            `json:"lastModified" db:"lastmodified"`

	RawLimit     int `db:"tlimit"`
	RawBalance   int `db:"balance"`
	RawFlags     int `db:"flags"`
	RawAssetType int `db:"assettype"`
}
