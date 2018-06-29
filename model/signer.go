package model

import (
  "github.com/mobius-network/astrograph/util"
)

type Signer struct {
	ID        string `json:"id"`
  AccountID string `json:"accountId" db:"accountid"`
	Signer    string `json:"signer"    db:"publickey"`
	Weight    int    `json:"weight"    db:"weight"`
}

func (s *Signer) DecodeRaw() {
  s.ID = util.SHA1(s.AccountID, s.Signer)
}
