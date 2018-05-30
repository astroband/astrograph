package ingest

import (
  "log"
  "strings"
  "database/sql"
  "github.com/mobius-network/astrograph/util"
  "github.com/mobius-network/astrograph/graph"
  "github.com/mobius-network/astrograph/config"
)

type Core struct {
  LedgerSeq uint64
}

func NewCore () *Core {
  c := new(Core)

  c.LedgerSeq = c.FetchMaxLedger()

  return c
}

func (c *Core) FetchMaxLedger() (uint64) {
  var seq uint64

  row := config.Db.QueryRow("SELECT ledgerseq FROM ledgerheaders ORDER BY ledgerseq DESC LIMIT 1")
  err := row.Scan(&seq)
  if err != nil { log.Fatal(err) }

  return seq
}

func (c *Core) checkLedger() (bool) {
  row := config.Db.QueryRow("SELECT ledgerseq FROM ledgerheaders WHERE ledgerseq = $1", c.LedgerSeq)
  err := row.Scan(&c.LedgerSeq)

  if (err == sql.ErrNoRows) {
    newSeq := c.FetchMaxLedger()
    if (c.LedgerSeq < newSeq) { c.LedgerSeq = newSeq }
    return false
  } else if (err != nil) {
    log.Fatal(err)
  }

  return true
}

func (c *Core) loadUpdatedAccounts(tableName string) ([]string) {
  var a []string = make([]string, 0)
  var id string

  rows, err := config.Db.Query("SELECT accountid FROM " + tableName + " WHERE lastmodified = $1", c.LedgerSeq)
  if (err != nil) {
    log.Fatal(err)
  }
  defer rows.Close()

  for rows.Next() {
    err := rows.Scan(&id)
    if err != nil { log.Fatal(err) }
    a = append(a, id)
  }

  return a
}

func (c *Core) loadAccounts(id []string) ([]graph.Account) {
  r := make([]graph.Account, 0)

  if (len(id) == 0) { return r }

  rows, err := config.Db.Query(`
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
    WHERE accountid IN ('` + strings.Join(id, "', '") + "')")

  if (err != nil) { log.Fatal(err) }

  defer rows.Close()
  for rows.Next() {
    a := graph.Account{}
    err := rows.Scan(
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

    if (err != nil) {
      log.Fatal(err)
    }

    r = append(r, a)
  }

  if err = rows.Err(); err != nil {
    log.Fatal(err)
  }

  return r
}

func (c *Core) Pull() (accounts []graph.Account) {
  log.Println("Ingesting ledger", c.LedgerSeq)

  if (!c.checkLedger()) { return }
  id := append(c.loadUpdatedAccounts("accounts"), c.loadUpdatedAccounts("trustlines")...)
  id = util.UniqueStringSlice(id)

  util.LogDebug("Updated accounts & trustlines:", id)
  log.Println("Updated", len(id), "accounts & trustlines")

  r := c.loadAccounts(id)

  c.LedgerSeq += 1

  return r
}
