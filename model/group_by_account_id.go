package model

import "reflect"

func GroupByAccountID(id []string, in interface{}, out interface{}) {
	ptr := reflect.ValueOf(out)
	outSlice := reflect.Indirect(ptr)
  inSlice := reflect.ValueOf(in)

  // Set resulting slice length to id length
	ptr.Elem().Set(
		reflect.MakeSlice(outSlice.Type(), len(id), len(id)),
	)

  // For each account id
	for y, v := range id {
    var r []interface{}

    // Filter models having account id in source slice
    for n := 0; n < inSlice.Len(); n++ {
      i := inSlice.Index(n).Interface()

      if (i.(Model).GetAccountID() == v) {
        r = append(r, i)
      }
    }

    // Create target slice of size of filtered items
		z := reflect.MakeSlice(outSlice.Type().Elem(), len(r), len(r))

    // Copy filtered items to target slice
    for x, i := range r {
			z.Index(x).Set(
        reflect.Indirect(reflect.ValueOf(i)),
      )
		}

		outSlice.Index(y).Set(z)
	}
}
