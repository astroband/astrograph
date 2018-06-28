package model

import (
	b64 "encoding/base64"
  "github.com/stellar/go/xdr"
)

type AccountThresholds struct {
	ID           string `json:"id"`
	MasterWeight int 		`json:"masterWeight"`
	Low          int 		`json:"low"`
	Medium       int 		`json:"medium"`
	High         int 		`json:"high"`
}

func NewAccountThresholdsFromRaw(raw string, id string) AccountThresholds {
	t, err := b64.StdEncoding.DecodeString(raw)
	if (err != nil) { return AccountThresholds{} }

	return AccountThresholds{
		ID: id,
		MasterWeight: int(t[xdr.ThresholdIndexesThresholdMasterWeight]),
		Low: int(t[xdr.ThresholdIndexesThresholdLow]),
		Medium: int(t[xdr.ThresholdIndexesThresholdMed]),
		High: int(t[xdr.ThresholdIndexesThresholdHigh]),
	}
}
