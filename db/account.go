package db

import (
	"database/sql"
	"github.com/mobius-network/astrograph/config"
	"github.com/mobius-network/astrograph/model"
)

// Returns single account or nil
func QueryAccount(id string) (*model.Account, error) {
	row := config.Db.QueryRow(selectAccount+" = $1", id)
	ac, err := scanAccount(row)

	switch {
	case err == sql.ErrNoRows:
		return nil, nil
	case err != nil:
		return nil, err
	default:
		return ac, nil
	}
}

// Returns a set of accounts by id
func QueryAccounts(id []string) ([]model.Account, error) {
	r := make([]model.Account, 0)

	if len(id) == 0 {
		return r, nil
	}

	rows, err := config.Db.Query(selectAccount + sqlIn(id))
	if err != nil {
		return nil, err
	}

	defer rows.Close()
	for rows.Next() {
		a, err := scanAccount(rows)
		if err != nil {
			return nil, err
		}
		r = append(r, *a)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return r, nil
}

// Fetch account data from request
func scanAccount(r scanner) (*model.Account, error) {
	a := model.Account{}

	err := r.Scan(
		&a.ID,
		&a.Balance,
		&a.Seqnum,
		&a.Numsubentries,
		&a.Inflationdest,
		&a.Homedomain,
		&a.Thresholds,
		&a.Flags,
		&a.Lastmodified,
	)

	if err != nil {
		return nil, err
	}

	return &a, nil
}
