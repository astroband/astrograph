package db

import "github.com/mobius-network/astrograph/config"

var (
  b = config.SqlBuilder
  accountsSql = b.Select("*").From("accounts")
  ledgerSeqSql = b.Select("ledgerseq").From("ledgerheaders")
)
