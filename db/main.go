package db

import (
  "strings"
  "database/sql"
  "github.com/mobius-network/astrograph/model"
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

  selectTrustline = `
    SELECT
      assettype,
      issuer,
      assetcode,
      tlimit,
      balance,
      flags,
      lastmodified
    FROM trustlines
    WHERE accountid
  `
)

// database/sql has no interface to sql.Scan(...interface{]})
type scanner interface {
  Scan(...interface {}) error
}

// Returns single account or nil
func QueryAccount(id string) (*model.Account, error) {
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
func QueryAccounts(id []string) ([]model.Account, error) {
  r := make([]model.Account, 0)

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

func QueryTrustlines(id []string) ([]model.Trustline, error) {
  r := make([]model.Trustline, 0)

  rows, err := config.Db.Query(selectTrustline + sqlIn(id) + " ORDER BY accountid, assettype, assetcode")
  if (err != nil) { return nil, err }

  defer rows.Close()
  for rows.Next() {
    t, err := scanTrustline(rows)
    if (err != nil) { return nil, err }
    r = append(r, *t)
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

  if (err != nil) { return nil, err }

  return &a, nil
}

// Fetch trustline data from request
func scanTrustline(r scanner) (*model.Trustline, error) {
  t := model.Trustline{}

  err := r.Scan(
    &t.Assettype,
    &t.Issuer,
    &t.Assetcode,
    &t.Tlimit,
    &t.Balance,
    &t.Flags,
    &t.Lastmodified,
  )

  if (err != nil) { return nil, err }

  return &t, nil
}

func sqlIn(v []string) string {
  return " IN('" + strings.Join(v, "', '") + "')";
}
