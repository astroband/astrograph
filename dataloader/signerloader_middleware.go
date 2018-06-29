//go:generate gorunpkg github.com/vektah/dataloaden -keys string -slice github.com/mobius-network/astrograph/model.Signer
package dataloader

import (
	"context"
	"github.com/mobius-network/astrograph/db"
	"github.com/mobius-network/astrograph/model"
	"net/http"
	"time"
)

const SignerLoaderKey = "signerloader"

func SignerLoaderMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		signerLoader := SignerSliceLoader{
			maxBatch: 100,
			wait:     100 * time.Millisecond,
			fetch: func(keys []string) ([][]model.Signer, []error) {
				r, err := db.QuerySigners(keys)
				if err != nil { return nil, []error{err} }
				return r, nil
			},
		}
		ctx := context.WithValue(r.Context(), SignerLoaderKey, &signerLoader)
		r = r.WithContext(ctx)
		next.ServeHTTP(w, r)
	})
}
