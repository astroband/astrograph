//go:generate gorunpkg github.com/cheekybits/genny -in=../gen/group_by_account_id.go -out=group_by_account_id_trust_line_gen.go gen "Model=model.TrustLine"

package db

import (
	"fmt"
	"reflect"
	"gopkg.in/ahmetb/go-linq.v3"
	sq "github.com/Masterminds/squirrel"
	"github.com/mobius-network/astrograph/model"
	"github.com/mobius-network/astrograph/config"
)

// Requests trustlines for given accounts and returns slices of trustlines in same order as given id
func QueryTrustLines(id []string) ([][]model.TrustLine, error) {
	rows, err := fetchTrustLineRows(id)
	if (err != nil) { return nil, err }

	var r[][]model.TrustLine
	groupByAccountID(id, rows, &r)
	fmt.Println(len(r))
	return r, nil
	//return groupTrustLines(id, rows), nil
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

func groupByAccountID(id []string, in interface{}, out interface{}) {
	ptr := reflect.ValueOf(out)
	slice := reflect.Indirect(ptr)

	ptr.Elem().Set(
		reflect.MakeSlice(slice.Type(), len(id), len(id)),
	)

	for y, v := range id {
		r := linq.
			From(in).
			WhereT(func(m model.Model) bool { return m.GetAccountID() == v }).
			Results()

		z := reflect.MakeSlice(slice.Type().Elem(), len(r), len(r))

		linq.From(r).ForEachIndexed(func(x int, i interface{}) {
			z.Index(x).Set(reflect.Indirect(reflect.ValueOf(i)))
		})

		slice.Index(y).Set(z)
	}
}

func groupTrustLines(id []string, rows []*model.TrustLine) [][]model.TrustLine {
	var r [][]model.TrustLine

	linq.
	  From(id).
	  Select(
	    func (n interface{}) interface{} {
	      var l []model.TrustLine

	      linq.
	        From(rows).
	        WhereT(func(i model.Model) bool { return i.GetAccountID() == n }).
	        SelectT(func(i model.Model) model.TrustLine { return *i.(*model.TrustLine) }).
	        ToSlice(&l)

	      return l
	    },
	  ).
	  ToSlice(&r)

	return r
}
