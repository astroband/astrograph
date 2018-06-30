package db

import (
	"gopkg.in/ahmetb/go-linq.v3"
	sq "github.com/Masterminds/squirrel"
	"github.com/mobius-network/astrograph/model"
	"github.com/mobius-network/astrograph/config"
)

// Requests trustlines for given accounts and returns slices of trustlines in same order as given id
func QuerySigners(id []string) (r []*model.Signer, err error) {
	r, err = fetchSignerRows(id)
	if (err != nil) { return }

	return
}

// Returns slice of data entries for requested accounts ordered
func fetchSignerRows(id []string) ([]*model.Signer, error) {
	var r []*model.Signer

	q, args, err := bSigners.Where(sq.Eq{"accountid": id}).ToSql()

	if err != nil { return nil, err }

	err = config.DB.Select(&r, q, args...)
	if err != nil { return nil, err }

	for _, t := range r {
		t.DecodeRaw()
	}

	return r, nil
}
