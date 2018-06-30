//go:generate gorunpkg github.com/vektah/dataloaden -keys string -slice github.com/mobius-network/astrograph/model.DataEntry
//NOTE: Might output malformed file name, needs to be fixed
package dataloader

import (
	"context"
	"github.com/mobius-network/astrograph/db"
	"github.com/mobius-network/astrograph/model"
	"net/http"
	"time"
)

const DataEntryLoaderKey = "dataentryloader"

func DataEntryLoaderMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		dataEntryLoader := DataEntrySliceLoader{
			maxBatch: 100,
			wait:     100 * time.Millisecond,
			fetch: func(keys []string) ([][]model.DataEntry, []error) {
				rows, err := db.QueryDataEntries(keys)
				if err != nil { return nil, []error{err} }

				var r [][]model.DataEntry
				model.GroupByAccountID(keys, rows, &r)
				return r, nil
			},
		}
		ctx := context.WithValue(r.Context(), DataEntryLoaderKey, &dataEntryLoader)
		r = r.WithContext(ctx)
		next.ServeHTTP(w, r)
	})
}
