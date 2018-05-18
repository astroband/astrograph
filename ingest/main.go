package ingest

import (
  "log"
  "database/sql"
//  "github.com/mobius-network/stellar-graphql-server/graph"
  "github.com/mobius-network/stellar-graphql-server/config"
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
  // Check that current ledger exists and populated
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

func (c *Core) loadUpdatedAccounts() ([]string) {
  var a []string = make([]string, 0)
  var id string

  rows, err := config.Db.Query("SELECT accountid FROM accounts WHERE lastmodified = $1", c.LedgerSeq)
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

func (c *Core) Pull() {
  log.Printf("Ingesting ledger %v", c.LedgerSeq)

  if (!c.checkLedger()) { return }

  id := c.loadUpdatedAccounts()
  log.Println(id)

  c.LedgerSeq += 1
  //rows := config.Db.QueryRows("SELECT * FROM accounts WHERE lastmodified = ?", c.LedgerSeq)
}
