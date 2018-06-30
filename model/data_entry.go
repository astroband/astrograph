package model

import (
  b64 "encoding/base64"
  "github.com/mobius-network/astrograph/util"
)

func (e *DataEntry) DecodeRaw() {
  value, _ := b64.StdEncoding.DecodeString(e.RawValue)
  // if (err != nil) { err }

  e.Value = string(value)
  e.ID = util.SHA1(e.AccountID, e.Name, "dataentry")
}
