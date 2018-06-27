package model

// Amounts are divided by this value to float conversion
const BalancePrecision = 10000000

type AccountFlags struct {
	ID            string `json:"id"`
	AuthRequired  bool 	 `json:"authRequired"`
	AuthRevokable bool   `json:"authRevokable"`
	AuthImmutable bool   `json:"authImmutable"`
}
type AccountThresholds struct {
	ID           string `json:"id"`
	MasterWeight int 		`json:"masterWeight"`
	Low          int 		`json:"low"`
	Medium       int 		`json:"medium"`
	High         int 		`json:"high"`
}
type DataEntry struct {
	ID           string `json:"id"`
	AccountID    string `json:"accountId"`
	Name         string `json:"name"`
	Value        string `json:"value"`
	LastModified int    `json:"lastModified"`
}
type Account struct {
	ID             string            `json:"id" db:"accountid"`
	Balance        float64           `json:"balance"`
	SequenceNumber int               `json:"sequenceNumber" db:"seqnum"`
	NumSubentries  int               `json:"numSubentries" db:"numsubentries"`
	InflationDest  *string           `json:"inflationDest" db:"inflationdest"`
	HomeDomain     *string           `json:"homeDomain" db:"homedomain"`
	Thresholds     AccountThresholds `json:"thresholds" db:"-"`
	Flags          AccountFlags      `json:"flags" db:"-"`
	LastModified   int               `json:"lastModified" db:"lastmodified"`

	RawThresholds  string            `db:"thresholds"`
	RawFlags       int							 `db:"flags"`
}
type Trustline struct {
	ID           string  `json:"id"`
	AccountID    string  `json:"accountId" db:"accountid"`
	AssetType    int     `json:"assetType" db:"assettype"`
	Issuer       string  `json:"issuer" db:"assetissuer"`
	AssetCode    string  `json:"assetCode" db:"assetcode"`
	Limit        float64 `json:"limit" db:"-"`
	Balance      float64 `json:"balance" db:"-"`
	Flags        int     `json:"flags" db:"flags"`
	LastModified int     `json:"lastModified" db:"lastmodified"`

	RawLimit     int     `db:"tlimit"`
	RawBalance   int     `db:"balance"`
}
