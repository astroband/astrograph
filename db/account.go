package db

import (
	"database/sql"
	sq "github.com/Masterminds/squirrel"
	"github.com/mobius-network/astrograph/model"
	"github.com/mobius-network/astrograph/config"
)

// Returns single account or nil
func QueryAccount(id string) (*model.Account, error) {
	var account *model.Account

	q, args, err := bAccounts.Where(sq.Eq{"accountid": id}).ToSql()
	if (err != nil) { return nil, err }

	err = config.DB.Get(&account, q, args...)

	switch {
	case err == sql.ErrNoRows:
		return nil, nil
	case err != nil:
		return nil, err
	default:
		account.DecodeRaw()
		return account, nil
	}
}

// Returns a set of accounts by id
func QueryAccounts(id []string) (r []*model.Account, err error) {
	if (len(id) == 0) { return }

	q, args, err := bAccounts.Where(sq.Eq{"accountid": id}).ToSql()
	if err != nil { return nil, err }

	err = config.DB.Select(&r, q, args...)
	if err != nil { return nil, err }

	for _, t := range r {
		t.DecodeRaw()
	}

	return
}

func QueryAccountsOrdered(id []string) (r []*model.Account, err error) {
	rs, err := QueryAccounts(id)
	if err != nil { return }

	r = make([]*model.Account, len(id))

	for n, i := range id {
		for _, a := range rs {
			if a.ID == i {
				r[n] = a
			}
		}
	}

	return
}
