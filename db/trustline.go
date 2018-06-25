package db

import (
	"github.com/mobius-network/astrograph/config"
	"github.com/mobius-network/astrograph/model"
)

// Requests trustlines for given accounts
func QueryTrustlines(id []string) ([]model.Trustline, error) {
	r := make([]model.Trustline, 0)

	rows, err := config.Db.Query(selectTrustline + sqlIn(id) + " ORDER BY accountid, assettype, assetcode")
	if err != nil {
		return nil, err
	}

	defer rows.Close()
	for rows.Next() {
		t, err := scanTrustline(rows)
		if err != nil {
			return nil, err
		}
		r = append(r, *t)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return r, nil
}

// Fetch trustline data from request
func scanTrustline(r scanner) (*model.Trustline, error) {
	t := model.Trustline{}

	err := r.Scan(
		&t.AccountID,
		&t.Assettype,
		&t.Issuer,
		&t.Assetcode,
		&t.Tlimit,
		&t.Balance,
		&t.Flags,
		&t.Lastmodified,
	)

	if err != nil {
		return nil, err
	}

	return &t, nil
}
