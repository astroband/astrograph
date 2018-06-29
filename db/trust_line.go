package db

import (
	// "fmt"
	// "gopkg.in/ahmetb/go-linq.v3"
	sq "github.com/Masterminds/squirrel"
	"github.com/mobius-network/astrograph/model"
	"github.com/mobius-network/astrograph/config"
)

// Requests trustlines for given accounts and returns slices of trustlines in same order as given id
func QueryTrustLines(id []string) ([][]model.TrustLine, error) {
	rows, err := fetchTrustLineRows(id)
	if (err != nil) { return nil, err }

	// var r [][]model.TrustLine
	//
	// linq.
	// 	From(id).
	// 	Select(
	// 		func (n interface{}) interface{} {
	// 			var l []model.TrustLine
	//
	// 			linq.
	// 				From(rows).
	// 				Where(func(i interface{}) bool { return i.(*model.TrustLine).AccountID == n }).
	// 				Select(func(i interface{}) interface{} { return *(i.(*model.TrustLine)) }).
	// 				ToSlice(&l)
	//
	// 			return l
	// 	  },
	// 	).
	// 	ToSlice(&r)
	//
	// fmt.Println(r)
	r := make([][]model.TrustLine, len(id))
	i := make([]model.TrustLine, len(rows))

	for n, r := range(rows) {
		i[n] = *r
	}

	err = groupBy("AccountID", id, i, &r)
	if err != nil { return nil, err }

	return r, nil
}

// Returns slice of trustlines for requested accounts ordered
func fetchTrustLineRows(id []string) ([]*model.TrustLine, error) {
	var r []*model.TrustLine

	q, args, err := bTrustLines.Where(sq.Eq{"accountid": id}).ToSql()
	if err != nil { return nil, err }

	err = config.DB.Select(&r, q, args...)
	if err != nil { return nil, err }

	decodeAllRaw(r)

	return r, nil
}
