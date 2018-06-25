package db

import (
	"strings"
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
      accountid,
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
	Scan(...interface{}) error
}

func sqlIn(v []string) string {
	return " IN('" + strings.Join(v, "', '") + "')"
}
