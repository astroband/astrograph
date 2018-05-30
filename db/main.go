package db

import (
  "strings"
  "database/sql"
  "github.com/mobius-network/astrograph/graph"
  "github.com/mobius-network/astrograph/config"
)

// Template queries
const (
  selectAccount = `
    SELECT
      accountid,
      balance,
      seqnum,
      numsubentries,
      inflationdest,
      homedomain,
      thresholds,
      flags,
      lastmodified
    FROM accounts
    WHERE accountid
  `
)

// database/sql has no interface to sql.Scan(...interface{]})
type scanner interface {
  Scan(...interface {}) error
}

// Returns single account or nil
func QueryAccount(id string) (*graph.Account, error) {
  row := config.Db.QueryRow(selectAccount + " WHERE accountid = $1", id)
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
func QueryAccounts(id []string) ([]graph.Account, error) {
  r := make([]graph.Account, 0)

  if (len(id) == 0) { return r, nil }

  rows, err := config.Db.Query(selectAccount + sqlIn(id))
  if (err != nil) { return nil, err }

  defer rows.Close()
  for rows.Next() {
    a, err := scanAccount(rows)
    if (err != nil) { return nil, err }
    r = append(r, *a)
  }

  if err = rows.Err(); err != nil {
    return nil, err
  }

  return r, nil
}

func scanAccount(r scanner) (*graph.Account, error) {
  a := graph.Account{}

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

  if (err != nil) { return nil, err }

  return &a, nil
}

func sqlIn(v []string) string {
  return " IN('" + strings.Join(v, "', '") + "')";
}
