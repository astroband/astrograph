//go:generate gorunpkg github.com/cheekybits/genny -in=../gen/group_by_account_id.go -out=group_by_account_id_trust_line_gen.go gen "Model=model.TrustLine"

package db

import (
	"gopkg.in/ahmetb/go-linq.v3"
	sq "github.com/Masterminds/squirrel"
	"github.com/mobius-network/astrograph/model"
	"github.com/mobius-network/astrograph/config"
)

// Requests trustlines for given accounts and returns slices of trustlines in same order as given id
func QueryTrustLines(id []string) ([][]model.TrustLine, error) {
	rows, err := fetchTrustLineRows(id)
	if (err != nil) { return nil, err }

	var r [][]model.TrustLine

	linq.
	  From(id).
	  Select(
	    func (n interface{}) interface{} {
	      var l []model.TrustLine

	      linq.
	        From(rows).
	        WhereT(func(i *model.TrustLine) bool { return i.AccountID == n }).
	        SelectT(func(i *model.TrustLine) model.TrustLine { return *i }).
	        ToSlice(&l)

	      return l
	    },
	  ).
	  ToSlice(&r)

	return r, nil
}

// Returns slice of trustlines for requested accounts ordered
func fetchTrustLineRows(id []string) ([]*model.TrustLine, error) {
	var r []*model.TrustLine

	q, args, err := bTrustLines.Where(sq.Eq{"accountid": id}).ToSql()
	if err != nil { return nil, err }

	err = config.DB.Select(&r, q, args...)
	if err != nil { return nil, err }

	for _, t := range r {
		t.DecodeRaw()
	}

	return r, nil
}
