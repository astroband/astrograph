package db

import (
	sq "github.com/Masterminds/squirrel"
	"github.com/mobius-network/astrograph/model"
	"github.com/mobius-network/astrograph/config"
)

// Requests trustlines for given accounts and returns slices of trustlines in same order as given id
func QuerySigners(id []string) (r []*model.Signer, err error) {
	q, args, err := bSigners.Where(sq.Eq{"accountid": id}).ToSql()

	if err != nil { return }

	err = config.DB.Select(&r, q, args...)
	if err != nil { return }

	for _, t := range r {
		t.DecodeRaw()
	}

	return
}
