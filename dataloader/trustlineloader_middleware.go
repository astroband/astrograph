//go:generate gorunpkg github.com/vektah/dataloaden -keys string -slice github.com/mobius-network/astrograph/model.TrustLine
package dataloader

import (
	"context"
	"github.com/mobius-network/astrograph/db"
	"github.com/mobius-network/astrograph/model"
	"net/http"
	"time"
)

const TrustLineLoaderKey = "trustlineloader"

func TrustLineLoaderMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		trustLineLoader := TrustLineSliceLoader{
			maxBatch: 100,
			wait:     100 * time.Millisecond,
			fetch: func(keys []string) ([][]model.TrustLine, []error) {
				rows, err := db.QueryTrustLines(keys)
				if err != nil { return nil, []error{err} }

				var r [][]model.TrustLine
				model.GroupByAccountID(keys, rows, &r)
				return r, nil
			},
		}
		ctx := context.WithValue(r.Context(), TrustLineLoaderKey, &trustLineLoader)
		r = r.WithContext(ctx)
		next.ServeHTTP(w, r)
	})
}
