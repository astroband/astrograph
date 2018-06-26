package db

import (
	"database/sql"
	b64 "encoding/base64"
	"github.com/stellar/go/xdr"
	"github.com/mobius-network/astrograph/model"
	"github.com/mobius-network/astrograph/config"
)

// Returns single account or nil
func QueryAccount(id string) (*model.Account, error) {
	row := config.Db.QueryRow(selectAccount+" = $1", id)
	ac, err := scanAccount(row)

	switch {
	case err == sql.ErrNoRows:
		return nil, nil
	case err != nil:
		return nil, err
	default:
		return ac, nil
	}
}

// Returns a set of accounts by id
func QueryAccounts(id []string) ([]model.Account, error) {
	result := make([]model.Account, 0)

	if len(id) == 0 { return result, nil }

	rows, err := config.Db.Query(selectAccount + sqlIn(id))
	if err != nil {
		return nil, err
	}

	defer rows.Close()
	for rows.Next() {
		a, err := scanAccount(rows)
		if err != nil {
			return nil, err
		}
		result = append(result, *a)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return result, nil
}

// Fetch account data from request
func scanAccount(r scanner) (*model.Account, error) {
	a := model.Account{}

	var thresholds string
	var flags int

	err := r.Scan(
		&a.ID,
		&a.Balance,
		&a.SequenceNumber,
		&a.NumSubentries,
		&a.InflationDest,
		&a.HomeDomain,
		&thresholds,
		&flags,
		&a.LastModified,
	)

	if err != nil { return nil, err }

	a.Balance = a.Balance / model.BalancePrecision
	a.Flags = fetchFlags(flags)

	a.Thresholds, err = fetchThresholds(thresholds)
	if err != nil { return nil, err }

	return &a, nil
}

func fetchFlags(flags int) (model.AccountFlags) {
	return model.AccountFlags{
		AuthRequired: flags & int(xdr.AccountFlagsAuthRequiredFlag) == 1,
		AuthRevokable: flags & int(xdr.AccountFlagsAuthRevocableFlag) == 1,
		AuthImmutable: flags & int(xdr.AccountFlagsAuthImmutableFlag) == 1,
	}
}

func fetchThresholds(thresholds string) (model.AccountThresholds, error) {
	t, err := b64.StdEncoding.DecodeString(thresholds)
	if (err != nil) { return model.AccountThresholds{}, err }

	return model.AccountThresholds{
		MasterWeight: int(t[xdr.ThresholdIndexesThresholdMasterWeight]),
		Low: int(t[xdr.ThresholdIndexesThresholdLow]),
		Medium: int(t[xdr.ThresholdIndexesThresholdMed]),
		High: int(t[xdr.ThresholdIndexesThresholdHigh]),
	}, nil
}
