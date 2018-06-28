package model

type DataEntry struct {
	ID           string `json:"id"`
	AccountID    string `json:"accountId" db:"accountid"`
	Name         string `json:"name" db:"dataname"`
	Value        string `json:"value" db:"-"`
	LastModified int    `json:"lastModified" db:"lastmodified"`

	RawValue     string `db:"datavalue"`
}
