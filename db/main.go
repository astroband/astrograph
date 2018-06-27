package db

import (
	"strings"
)

// Template queries
const (	
	selectMaxLedger = "SELECT ledgerseq FROM ledgerheaders ORDER BY ledgerseq DESC LIMIT 1"

	selectLedger = "SELECT ledgerseq FROM ledgerheaders WHERE ledgerseq = $1"

	selectUpdatedAccount = "SELECT accountid FROM "

	whereUpdatedAccount = " WHERE lastmodified = $1"

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

	selectTrustlineOrder = " ORDER BY accountid, assettype, assetcode"
)

// database/sql has no interface to sql.Scan(...interface{]})
type scanner interface {
	Scan(...interface{}) error
}

func sqlIn(v []string) string {
	return " IN('" + strings.Join(v, "', '") + "')"
}
