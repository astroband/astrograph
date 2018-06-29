package db

import (
  "reflect"
  "github.com/mobius-network/astrograph/config"
)

var (
  b = config.SqlBuilder
  accountsSql = b.Select("*").From("accounts")
  ledgerSeqSql = b.Select("ledgerseq").From("ledgerheaders")
)

type HasRawFields interface {
  DecodeRaw()
}

// Calls DecodeRaw() on every element of a slice
func decodeRawOnSlice(s interface {}) {
  v := reflect.ValueOf(s)
  for i := 0; i < v.Len(); i++ {
    v.Index(i).Interface().(HasRawFields).DecodeRaw()
  }
}
