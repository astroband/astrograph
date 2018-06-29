package model

import (
  "github.com/mobius-network/astrograph/util"
)

type Asset struct {
	ID      string    `json:"id"`
	Type    AssetType `json:"type"`
	Code    string  	`json:"code"`
	Issuer  string 	  `json:"issuer"`
}

func NewAssetFromRaw(rawCode string, rawType int, rawIssuer string) Asset {
  a := Asset{
    Code: rawCode,
    Type: NewAssetTypeFromRaw(rawType),
    Issuer: rawIssuer,
  }

  a.ID = util.SHA1(a.Type.String(), a.Code, a.Issuer, "asset")

  return a
}
