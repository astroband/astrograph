package model

import (
  b64 "encoding/base64"
  "github.com/mobius-network/astrograph/util"
)

type DataEntry struct {
	ID           string `json:"id"`
	AccountID    string `json:"accountId" db:"accountid"`
	Name         string `json:"name" db:"dataname"`
	Value        string `json:"value" db:"-"`
	LastModified int    `json:"lastModified" db:"lastmodified"`

	RawValue     string `db:"datavalue"`
}

func (e DataEntry) DecodeRaw() {
  value, _ := b64.StdEncoding.DecodeString(e.RawValue)
  // if (err != nil) { err }

  e.Value = string(value)
  e.ID = util.SHA1(e.AccountID, e.Name, "dataentry")
}
