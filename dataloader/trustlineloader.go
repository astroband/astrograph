//go:generate gorunpkg github.com/vektah/dataloaden -keys string -slice github.com/mobius-network/astrograph/model.Trustline
package dataloader

import (
	"context"
	"github.com/mobius-network/astrograph/db"
	"github.com/mobius-network/astrograph/model"
	"net/http"
	"time"
)

const TrustlineLoaderKey = "trustlineloader"

func TrustlineLoaderMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		trustlineLoader := TrustlineSliceLoader{
			maxBatch: 100,
			wait:     100 * time.Millisecond,
			fetch: func(keys []string) ([][]model.Trustline, []error) {
				r, err := db.QueryTrustlines(keys)
				if err != nil { return nil, []error{err} }
				return r, nil
			},
		}
		ctx := context.WithValue(r.Context(), TrustlineLoaderKey, &trustlineLoader)
		r = r.WithContext(ctx)
		next.ServeHTTP(w, r)
	})
}
