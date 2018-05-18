package ingest

import (
  "log"
  "database/sql"
  "github.com/mobius-network/stellar-graphql-server/config"
)

type Core struct {
  LedgerSeq uint64
}

func NewCore () *Core {
  c := new(Core)

  row := config.Db.QueryRow("SELECT ledgerseq FROM ledgerheaders ORDER BY ledgerseq DESC LIMIT 1")
  err := row.Scan(&c.LedgerSeq)
  if err != nil { log.Fatal(err) }

  // Sets cursor to last ledger + 1
  c.LedgerSeq += 1

  return c
}

func (c *Core) Pull() {
  log.Printf("Ingesting ledger %v", c.LedgerSeq)

  // Wait for current ledger to be populated completely
  row := config.Db.QueryRow("SELECT ledgerseq FROM ledgerheaders WHERE ledgerseq = $1", c.LedgerSeq)
  err := row.Scan(&c.LedgerSeq)

  if (err == sql.ErrNoRows) {
    log.Printf("Ledger %v is not populated yet", c.LedgerSeq)
    return
  } else {
    log.Fatal(err)
  }

  c.LedgerSeq += 1

  //rows := config.Db.QueryRows("SELECT * FROM accounts WHERE lastmodified = ?", c.LedgerSeq)
}
