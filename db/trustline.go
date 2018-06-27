package db

import (
	sq "github.com/Masterminds/squirrel"
	"github.com/mobius-network/astrograph/util"
	"github.com/mobius-network/astrograph/model"
	"github.com/mobius-network/astrograph/config"
)

// Requests trustlines for given accounts and returns slices of trustlines in same order as given id
func QueryTrustlines(id []string) ([][]model.Trustline, error) {
	rows, err := fetchTrustlineRows(id)
	if (err != nil) { return nil, err }

	result := make([][]model.Trustline, len(id))

	// For every given account
	for n, accountId := range id {
		accountTrustlines := make([]model.Trustline, 0)

		// Scan all rows
		for i, t := range rows {

			// If rows present and belongs to current account
			if (t != nil) && (t.AccountID == accountId) {

				// Add it to current slice and mark as "used"
				accountTrustlines = append(accountTrustlines, *t)
				rows[i] = nil
			}
		}

		result[n] = accountTrustlines // Put account trustlines slice to the same position as account id has in source slice
	}

	return result, nil
}

// Returns slice of trustlines for requested accounts ordered
func fetchTrustlineRows(id []string) ([]*model.Trustline, error) {
	var trustlines []*model.Trustline

	q, args, err := b.
		Select("*").
		From("trustlines").
		Where(sq.Eq{"accountid": id}).
		OrderBy("accountid, assettype, assetcode").
		ToSql()

	if err != nil { return nil, err }

	err = config.DB.Select(&trustlines, q, args...)
	if err != nil { return nil, err }

	for _, t := range trustlines {
		t.Balance = float64(t.RawBalance) / model.BalancePrecision
		t.Limit = float64(t.RawLimit) / model.BalancePrecision
		t.ID = util.SHA1(t.AccountID, string(t.AssetType), t.AssetCode, t.Issuer, "_trustline")
	}

	return trustlines, nil
}
