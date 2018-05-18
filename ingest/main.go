package ingest

import (
  "log"
  "github.com/mobius-network/stellar-graphql-server/config"
)

type Core struct {
  LedgerSeq uint64
}

func NewCore () *Core {
  c := new(Core)
  row := config.Database.QueryRow("SELECT ledgerseq FROM ledgerheaders ORDER BY ledgerseq DESC LIMIT 1")
  err := row.Scan(&c.LedgerSeq)
  if err != nil { log.Fatal(err) }

  return c
}

// func (c *Core) Pull()
