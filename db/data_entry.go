package db

import (
	sq "github.com/Masterminds/squirrel"
	"github.com/mobius-network/astrograph/model"
	"github.com/mobius-network/astrograph/config"
)

// Requests trustlines for given accounts and returns slices of trustlines in same order as given id
func QueryDataEntries(id []string) ([][]model.DataEntry, error) {
	rows, err := fetchDataEntryRows(id)
	if (err != nil) { return nil, err }

	result := make([][]model.DataEntry, len(id))

	// For every given account
	for n, accountId := range id {
		accountDataEntries := make([]model.DataEntry, 0)

		// Scan all rows
		for i, e := range rows {

			// If rows present and belongs to current account
			if (e != nil) && (e.AccountID == accountId) {

				// Add it to current slice and mark as "used"
				accountDataEntries = append(accountDataEntries, *e)
				rows[i] = nil
			}
		}

    // Put account data entries slice to the same position as account id has in source slice
		result[n] = accountDataEntries
	}

	return result, nil
}

// Returns slice of data entries for requested accounts ordered
func fetchDataEntryRows(id []string) ([]*model.DataEntry, error) {
	var dataEntries []*model.DataEntry

	q, args, err := b.
		Select("*").
		From("accountdata").
		Where(sq.Eq{"accountid": id}).
		OrderBy("accountid, dataname").
		ToSql()

	if err != nil { return nil, err }

	err = config.DB.Select(&dataEntries, q, args...)
	if err != nil { return nil, err }

  decodeRawOnSlice(dataEntries)

	return dataEntries, nil
}
