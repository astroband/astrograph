package db

import (
	"gopkg.in/ahmetb/go-linq.v3"
	sq "github.com/Masterminds/squirrel"
	"github.com/mobius-network/astrograph/model"
	"github.com/mobius-network/astrograph/config"
)

// Requests trustlines for given accounts and returns slices of trustlines in same order as given id
func QueryDataEntries(id []string) ([][]model.DataEntry, error) {
	rows, err := fetchDataEntryRows(id)
	if (err != nil) { return nil, err }

	return groupDataEntries(id, rows), nil
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

func groupDataEntries(id []string, rows []*model.DataEntry) [][]model.DataEntry {
	var r [][]model.DataEntry

	linq.
	  From(id).
	  Select(
	    func (n interface{}) interface{} {
	      var l []model.DataEntry

	      linq.
	        From(rows).
	        WhereT(func(i *model.DataEntry) bool { return i.AccountID == n }).
	        SelectT(func(i *model.DataEntry) model.DataEntry { return *i }).
	        ToSlice(&l)

	      return l
	    },
	  ).
	  ToSlice(&r)

	return r
}
