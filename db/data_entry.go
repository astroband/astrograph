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

	err = groupBy("AccountID", id, rows, &result)
	if err != nil { return nil, err }

	return result, nil
}

// Returns slice of data entries for requested accounts ordered
func fetchDataEntryRows(id []string) ([]*model.DataEntry, error) {
	var r []*model.DataEntry

	q, args, err := bDataEntries.Where(sq.Eq{"accountid": id}).ToSql()

	if err != nil { return nil, err }

	err = config.DB.Select(&r, q, args...)
	if err != nil { return nil, err }

	for _, t := range r {
		t.DecodeRaw()
	}

	return r, nil
}
