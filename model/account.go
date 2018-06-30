package model

import (
  "github.com/mobius-network/astrograph/util"
)

func (a *Account) DecodeRaw() {
  a.Balance = float64(a.RawBalance) / BalancePrecision
	a.Flags = NewAccountFlagsFromRaw(a.RawFlags, util.SHA1(a.ID, "flags"))
	a.Thresholds = NewAccountThresholdsFromRaw(a.RawThresholds, util.SHA1(a.ID, "thresholds"))
}
