package db

import (
	"github.com/mobius-network/astrograph/model"
	"github.com/mobius-network/astrograph/config"
)

// Requests trustlines for given accounts and returns slices of trustlines in same order as given id
func QueryTrustlines(id []string) ([][]*model.Trustline, error) {
	rows, err := fetchRows(id)
	if (err != nil) { return nil, err }

	result := make([][]*model.Trustline, len(id))

	// For every given account
	for n, accountId := range id {
		accountTrustlines := make([]*model.Trustline, 0)

		// Scan all rows
		for i, t := range rows {

			// If rows present and belongs to current account
			if (t != nil) && (t.AccountID == accountId) {

				// Add it to current slice and mark as "used"
				accountTrustlines = append(accountTrustlines, t)
				rows[i] = nil
			}
		}

		result[n] = accountTrustlines // Put account trustlines slice to the same position as account id has in source slice
	}

	return result, nil
}

// Returns slice of trustlines for requested accounts ordered
func fetchRows(id []string) ([]*model.Trustline, error) {
	rows, err := config.Db.Query(selectTrustline + sqlIn(id) + selectTrustlineOrder)
	if err != nil { return nil, err }

	result := make([]*model.Trustline, 0)

	defer rows.Close()
	for rows.Next() {
		t, err := scanTrustline(rows)
		if err != nil { return nil, err }
		result = append(result, t)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return result, nil
}

// Fetch trustline data from request
func scanTrustline(r scanner) (*model.Trustline, error) {
	t := model.Trustline{}

	err := r.Scan(
		&t.AccountID,
		&t.AssetType,
		&t.Issuer,
		&t.AssetCode,
		&t.Limit,
		&t.Balance,
		&t.Flags,
		&t.LastModified,
	)

	if err != nil {
		return nil, err
	}

	t.Balance = t.Balance / model.BalancePrecision
	t.Limit = t.Limit / model.BalancePrecision

	return &t, nil
}
