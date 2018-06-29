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

	err = groupBy("AccountID", id, rows, &result)
	if err != nil { return nil, err }

	return result, nil
}

// Returns slice of trustlines for requested accounts ordered
func fetchTrustLineRows(id []string) ([]*model.TrustLine, error) {
	var r []*model.TrustLine

	q, args, err := bTrustLines.Where(sq.Eq{"accountid": id}).ToSql()

	if err != nil { return nil, err }

	err = config.DB.Select(&r, q, args...)
	if err != nil { return nil, err }

	decodeRaw(r)

	return r, nil
}
