package db

import (
	"gopkg.in/ahmetb/go-linq.v3"
	sq "github.com/Masterminds/squirrel"
	"github.com/mobius-network/astrograph/model"
	"github.com/mobius-network/astrograph/config"
)

// Requests trustlines for given accounts and returns slices of trustlines in same order as given id
func QuerySigners(id []string) ([][]model.Signer, error) {
	rows, err := fetchSignerRows(id)
	if (err != nil) { return nil, err }

	var r [][]model.Signer

	linq.
	  From(id).
	  Select(
	    func (n interface{}) interface{} {
	      var l []model.Signer

	      linq.
	        From(rows).
	        WhereT(func(i *model.Signer) bool { return i.AccountID == n }).
	        SelectT(func(i *model.Signer) model.Signer { return *i }).
	        ToSlice(&l)

	      return l
	    },
	  ).
	  ToSlice(&r)

	return r, nil
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
