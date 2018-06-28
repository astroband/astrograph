package model

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
