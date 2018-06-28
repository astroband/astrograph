package db

import (
	sq "github.com/Masterminds/squirrel"
	"github.com/mobius-network/astrograph/model"
	"github.com/mobius-network/astrograph/config"
)

// Requests trustlines for given accounts and returns slices of trustlines in same order as given id
func QueryTrustLines(id []string) ([][]model.TrustLine, error) {
	rows, err := fetchTrustLineRows(id)
	if (err != nil) { return nil, err }

	result := make([][]model.TrustLine, len(id))

	// For every given account
	for n, accountId := range id {
		accountTrustLines := make([]model.TrustLine, 0)

		// Scan all rows
		for i, t := range rows {

			// If rows present and belongs to current account
			if (t != nil) && (t.AccountID == accountId) {

				// Add it to current slice and mark as "used"
				accountTrustLines = append(accountTrustLines, *t)
				rows[i] = nil
			}
		}

		result[n] = accountTrustLines // Put account trustlines slice to the same position as account id has in source slice
	}

	return result, nil
}

// Returns slice of trustlines for requested accounts ordered
func fetchTrustLineRows(id []string) ([]*model.TrustLine, error) {
	var trustLines []*model.TrustLine

	q, args, err := b.
		Select("*").
		From("trustlines").
		Where(sq.Eq{"accountid": id}).
		OrderBy("accountid, assettype, assetcode").
		ToSql()

	if err != nil { return nil, err }

	err = config.DB.Select(&trustLines, q, args...)
	if err != nil { return nil, err }

	decodeRawOnSlice(trustLines)

	return trustLines, nil
}
