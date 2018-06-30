package model

import (
  "github.com/mobius-network/astrograph/util"
)

func (s *Signer) DecodeRaw() {
  s.ID = util.SHA1(s.AccountID, s.Signer)
}
