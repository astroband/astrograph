//go:generate gorunpkg github.com/cheekybits/genny -in=../gen/group_by_account_id.go -out=group_by_account_id_trust_line_gen.go gen "Model=model.TrustLine"

package db

import (
	sq "github.com/Masterminds/squirrel"
	"github.com/mobius-network/astrograph/model"
	"github.com/mobius-network/astrograph/config"
)

// Requests trustlines for given accounts and returns slices of trustlines in same order as given id
func QueryTrustLines(id []string) (r []*model.TrustLine, err error) {
	if (len(id) == 0) { return }
	
	q, args, err := bTrustLines.Where(sq.Eq{"accountid": id}).ToSql()
	if err != nil { return }

	err = config.DB.Select(&r, q, args...)
	if err != nil { return }

	for _, t := range r {
		t.DecodeRaw()
	}

	return
}
