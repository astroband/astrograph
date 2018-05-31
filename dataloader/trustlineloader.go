package dataloader

import (
  "time"
  "context"
  "net/http"
  "database/sql"
  "github.com/mobius-network/astrograph/db"
  "github.com/mobius-network/astrograph/model"
)

const trustlineLoaderKey = "trustlineloader"

func TustlineloaderMiddleware(db *sql.DB, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		trustlineLoader := TrustlineLoader{
			maxBatch: 100,
			wait:     1 * time.Millisecond,
			fetch: func(keys []string) ([]*model.Trustline, []error) {
        r, err := db.QueryTrustlines(keys)
        if (err != nil) { return nil, []error{err} }

        rh := make([]*model.Trustline, len(r))
        for i, v := range r {
          rh[i] = &v
        }

        return rh, nil
			},
		}
		ctx := context.WithValue(r.Context(), trustlineLoaderKey, &trustlineLoader)
		r = r.WithContext(ctx)
		next.ServeHTTP(w, r)
	})
}

func getTrustlineLoader(ctx context.Context) *TrustlineLoader {
	return ctx.Value(trustlineLoaderKey).(*TrustlineLoader)
}

// func (r *Resolver) Todo_userLoader(ctx context.Context, obj *Todo) (*User, error) {
// 	return getUserLoader(ctx).Load(obj.UserID)
// }
