package db

import (
  "fmt"
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

// Groups array of in structs by value of field in order specified in keys and puts it to out
func groupBy(field string, keys []string, in interface{}, out interface{}) error {
  vin := reflect.ValueOf(in)
  vout := reflect.ValueOf(out)
  vintype := reflect.TypeOf(in)

  if vintype.Kind() != reflect.Slice {
		return fmt.Errorf("in must be slice")
	}

  if vout.Type().Kind() != reflect.Ptr {
    return fmt.Errorf("out must be *slice")
  }

  vout = vout.Elem()
  if vout.Type().Kind() != reflect.Slice {
    return fmt.Errorf("out must be *slice")
  }

  voutype := vintype.Elem()
  if voutype.Kind() == reflect.Ptr {
    voutype = reflect.SliceOf(voutype.Elem())
  }

  var used = make([]bool, vin.Len())

	for n, key := range keys {
		s := reflect.MakeSlice(voutype, 0, 0)

    for i := 0; i < vin.Len(); i++ {
      row := vin.Index(i)
      if (row.Kind() == reflect.Ptr) { row = row.Elem() }

      rowKey := row.FieldByName(field).String()

      if (!used[i]) && (rowKey == key) {
        s = reflect.Append(s, row)
        used[i] = true
      }
    }

    vout.Index(n).Set(s)
	}

  return nil
}
