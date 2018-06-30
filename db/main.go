package db

import (
  "github.com/mobius-network/astrograph/config"
)

var (
  b = config.SqlBuilder
  bAccounts = b.Select("*").From("accounts")
  bTrustLines = b.Select("*").From("trustlines").OrderBy("accountid, assettype, assetcode")
  bLedgers = b.Select("ledgerseq").From("ledgerheaders")
  bSigners = b.Select("*").From("signers").OrderBy("accountid, publickey")
  bDataEntries = b.Select("*").From("accountdata").OrderBy("accountid, dataname")
)
