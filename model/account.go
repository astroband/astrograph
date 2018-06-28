package model

import (
  "github.com/mobius-network/astrograph/util"
)

type Account struct {
	ID             string            `json:"id" db:"accountid"`
	Balance        float64           `json:"balance" db:"-"`
	SequenceNumber int               `json:"sequenceNumber" db:"seqnum"`
	NumSubentries  int               `json:"numSubentries" db:"numsubentries"`
	InflationDest  *string           `json:"inflationDest" db:"inflationdest"`
	HomeDomain     *string           `json:"homeDomain" db:"homedomain"`
	Thresholds     AccountThresholds `json:"thresholds" db:"-"`
	Flags          AccountFlags      `json:"flags" db:"-"`
	LastModified   int               `json:"lastModified" db:"lastmodified"`

	RawBalance     int               `db:"balance"`
	RawThresholds  string            `db:"thresholds"`
	RawFlags       int							 `db:"flags"`
}

func (a *Account) DecodeRaw() {
  a.Balance = float64(a.RawBalance) / BalancePrecision
	a.Flags = NewAccountFlags(a.RawFlags, util.SHA1(a.ID, "flags"))
	a.Thresholds = NewAccountThresholds(a.RawThresholds, util.SHA1(a.ID, "thresholds"))
}
