package model

// Amounts are divided by this value to float conversion
const BalancePrecision = 10000000

type Model interface {
  DecodeRaw()
  GetAccountID() string
}

type AssetType string

type Asset struct {
	ID      string    `json:"id"`
	Type    AssetType `json:"type"`
	Code    string  	`json:"code"`
	Issuer  string 	  `json:"issuer"`
}

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
	AccountID    string `json:"accountId" db:"accountid"`
	Name         string `json:"name" db:"dataname"`
	Value        string `json:"value" db:"-"`
	LastModified int    `json:"lastModified" db:"lastmodified"`

	RawValue     string `db:"datavalue"`
}

type Signer struct {
	ID        string `json:"id"`
  AccountID string `json:"accountId" db:"accountid"`
	Signer    string `json:"signer"    db:"publickey"`
	Weight    int    `json:"weight"    db:"weight"`
}

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

type TrustLineFlags struct {
  ID				 string `json:"id"`
  Authorized bool   `json:"authorized" db:"-"`
}

type TrustLine struct {
	ID           string         `json:"id"`
	AccountID    string         `json:"accountId" db:"accountid"`
	Asset        Asset          `json:"asset"`
	Limit        float64        `json:"limit" db:"-"`
	Balance      float64        `json:"balance" db:"-"`
	Flags        TrustLineFlags `json:"flags" db:"-"`
	LastModified int            `json:"lastModified" db:"lastmodified"`

	RawLimit       int    			`db:"tlimit"`
	RawBalance     int    			`db:"balance"`
	RawFlags       int    			`db:"flags"`
	RawAssetType   int    			`db:"assettype"`
	RawAssetCode   string 			`db:"assetcode"`
	RawAssetIssuer string 			`db:"issuer"`
}
