package db

import (
	sq "github.com/Masterminds/squirrel"
	"github.com/mobius-network/astrograph/model"
	"github.com/mobius-network/astrograph/config"
)

// Requests trustlines for given accounts and returns slices of trustlines in same order as given id
func QuerySigners(id []string) ([][]model.Signer, error) {
	rows, err := fetchSignerRows(id)
	if (err != nil) { return nil, err }

	result := make([][]model.Signer, len(id))

  err = groupBy("AccountID", id, rows, &result)
	if err != nil { return nil, err }

	return result, nil
}

// Returns slice of data entries for requested accounts ordered
func fetchSignerRows(id []string) ([]*model.Signer, error) {
	var r []*model.Signer

	q, args, err := bSigners.Where(sq.Eq{"accountid": id}).ToSql()

	if err != nil { return nil, err }

	err = config.DB.Select(&r, q, args...)
	if err != nil { return nil, err }

  decodeRaw(r)

	return r, nil
}
