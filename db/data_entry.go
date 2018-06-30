package db

import (
	sq "github.com/Masterminds/squirrel"
	"github.com/mobius-network/astrograph/model"
	"github.com/mobius-network/astrograph/config"
)

// Requests data entries for given accounts and returns slices of trustlines in same order as given id
func QueryDataEntries(id []string) (r []*model.DataEntry, err error) {
	q, args, err := bDataEntries.Where(sq.Eq{"accountid": id}).ToSql()
	if err != nil { return }

	err = config.DB.Select(&r, q, args...)
	if err != nil { return }

	for _, t := range r {
		t.DecodeRaw()
	}

	return
}
