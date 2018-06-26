package model

type Account struct {
	ID             string  `json:"id"`
	Balance        int     `json:"balance"`
	SequenceNumber int     `json:"sequenceNumber"`
	NumSubentries  int     `json:"numSubentries"`
	InflationDest  *string `json:"inflationDest"`
	HomeDomain     *string `json:"homeDomain"`
	Thresholds     *string `json:"thresholds"`
	Flags          int     `json:"flags"`
	LastModified   int     `json:"lastModified"`
}
type Trustline struct {
	AccountID    string `json:"accountId"`
	AssetType    int    `json:"assetType"`
	Issuer       string `json:"issuer"`
	AssetCode    string `json:"assetCode"`
	Limit        int    `json:"limit"`
	Balance      int    `json:"balance"`
	Flags        int    `json:"flags"`
	LastModified int    `json:"lastModified"`
}
