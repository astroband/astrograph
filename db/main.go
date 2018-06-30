package db

import (
  // "fmt"
  // "reflect"
  // "gopkg.in/ahmetb/go-linq.v3"
  //"github.com/mobius-network/astrograph/model"
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

// func groupByAccountID(id []string, in []model.Model) [][]model.Model {
//   var out [][]model.Model = make([][]model.Model, len(id))
//
//   for y, i := range id {
//     out[y] = make([]model.Model, 0)
//     for x := 0; x < len(in); x++ {
//       if (in[x].(model.Model).GetAccountID() == i) {
//         out[y] = append(out[y], in[x])
//       }
//     }
//   }
//
//   return out

  // for y := 0; y < len(y); y++ {
  //   out[y] = make([]model.Model, len(in[y]))
  //   for x := 0; x < len(in[y]); x++ {
  //     out[y][x] = model.Model(in[y][x])
  //   }
  // }
  // linq.
  //   From(id).
  //   Select(
  //     func (n interface{}) interface{} {
  //       return linq.
  //         From(rows).
  //         Where(func(i interface{}) bool { return i.(model.Model).GetAccountID() == n }).
  //         Results()
  //     },
  //   ).
  //   ToSlice(&z)
//}

// // Groups array of in structs by value of field in order specified in keys and puts it to out. Output may contain gaps
// // if nothing was found.
// func groupBy(field string, keys []string, in interface{}, out interface{}) error {
//   // vin := reflect.ValueOf(in)
//   // vout := reflect.ValueOf(out)
//   // vintype := reflect.TypeOf(in)
//   //
//   // if vintype.Kind() != reflect.Slice {
// 	// 	return fmt.Errorf("in must be slice")
// 	// }
//   //
//   // if vout.Type().Kind() != reflect.Ptr {
//   //   return fmt.Errorf("out must be *slice")
//   // }
//   //
//   // vout = vout.Elem()
//   // if vout.Type().Kind() != reflect.Slice {
//   //   return fmt.Errorf("out must be *slice")
//   // }
//   //
//   // voutype := vintype.Elem()
//   // if voutype.Kind() == reflect.Ptr {
//   //   voutype = reflect.SliceOf(voutype.Elem())
//   // }
//   //
//   // var used = make([]bool, vin.Len())
//   //
// 	// for n, key := range keys {
// 	// 	s := reflect.MakeSlice(voutype, 0, 0)
//   //
//   //   for i := 0; i < vin.Len(); i++ {
//   //     row := vin.Index(i)
//   //     if (row.Kind() == reflect.Ptr) { row = row.Elem() }
//   //
//   //     rowKey := row.FieldByName(field).String()
//   //
//   //     if (!used[i]) && (rowKey == key) {
//   //       s = reflect.Append(s, row)
//   //       used[i] = true
//   //     }
//   //   }
//   //
//   //   vout.Index(n).Set(s)
// 	// }
//   //
//   // return nil
//
//   linq.
// 		From(keys).
// 		Select(
// 			func (k interface{}) interface{} {
//         // t := reflect.TypeOf(out).Elem().Elem()
// 				// l := reflect.MakeSlice(t, 10, 10)
//         // z := reflect.New(l.Type())
//         // z.Elem().Set(l)
//         //
//         // res := reflect.ValueOf(z)
//       	// slice := reflect.Indirect(res)
//         // fmt.Println(res.Kind())
//         // fmt.Println(slice.Kind())
//         // fmt.Println(slice.Cap())
//         // fmt.Println(res.Elem())
//         // fmt.Println(reflect.TypeOf(slice).String())
//
//         // res := reflect.ValueOf(l)
//         // fmt.Println(res.String())
//       	// slice := reflect.Indirect(res)
//         // fmt.Println(reflect.TypeOf(slice.Interface()).String())
//
// 				return linq.
// 					From(in).
// 					//Where(func(i interface{}) bool { return reflect.ValueOf(i).Elem().FieldByName(field).Interface() == k }).
// 					Select(func(i interface{}) interface{} {
//             return i
//             // v := reflect.Indirect(reflect.ValueOf(i)).Interface()
//             // fmt.Println(v)
//             // fmt.Println(reflect.TypeOf(v))
//             // return v
//           }).
// 					Results()
// 		  },
// 		).
//     Select(func (i interface {}) interface {} {
//
//     }).
// 		ToSlice(out)
//
//   return nil
// }
