package model

const BalancePrecision = 10000000

type AccountFlags struct {
	AuthRequired bool  `json:"authRequired"`
	AuthRevokable bool `json:"authRevokable"`
	AuthImmutable bool `json:"authImmutable"`
}
type AccountThresholds struct {
	MasterWeight int `json:"masterWeight"`
	Low          int `json:"low"`
	Medium       int `json:"medium"`
	High         int `json:"high"`
}
type Account struct {
	ID             string            `json:"id"`
	Balance        float64           `json:"balance"`
	SequenceNumber int               `json:"sequenceNumber"`
	NumSubentries  int               `json:"numSubentries"`
	InflationDest  *string           `json:"inflationDest"`
	HomeDomain     *string           `json:"homeDomain"`
	Thresholds     AccountThresholds `json:"thresholds"`
	Flags          AccountFlags      `json:"flags"`
	LastModified   int               `json:"lastModified"`
}
type Trustline struct {
	AccountID    string  `json:"accountId"`
	AssetType    int     `json:"assetType"`
	Issuer       string  `json:"issuer"`
	AssetCode    string  `json:"assetCode"`
	Limit        float64 `json:"limit"`
	Balance      float64 `json:"balance"`
	Flags        int     `json:"flags"`
	LastModified int     `json:"lastModified"`
}
