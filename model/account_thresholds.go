package model

import (
	b64 "encoding/base64"
  "github.com/stellar/go/xdr"
)

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
