package dataloader

import (
//  "time"
  "context"
  "net/http"
  "database/sql"
//  "github.com/mobius-network/astrograph/model"
//  "github.com/mobius-network/astrograph/config"
)

const trustlineLoaderKey = "trustlineloader"

func TustlineloaderMiddleware(db *sql.DB, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// userloader := TrustlineLoader{
		// 	maxBatch: 100,
		// 	wait:     1 * time.Millisecond,
		// 	fetch: func(keys []string) ([]*model.Trustline, []error) {
		// 		placeholders := make([]string, len(keys))
		// 		args := make([]interface{}, len(keys))
		// 		for i := 0; i < len(ids); i++ {
		// 			placeholders[i] = "?"
		// 			args[i] = i
		// 		}
    //
		// 		res := logAndQuery(db,
		// 			"SELECT id, name from dataloader_example.user WHERE id IN ("+
		// 				strings.Join(placeholders, ",")+")",
		// 			args...,
		// 		)
		// 		defer res.Close()
    //
		// 		users := make([]*model.Trustline, len(ids))
		// 		i := 0
		// 		for res.Next() {
		// 			users[i] = &User{}
		// 			err := res.Scan(&users[i].ID, &users[i].Name)
		// 			if err != nil {
		// 				panic(err)
		// 			}
		// 			i++
		// 		}
    //
		// 		return users, nil
		// 	},
		// }
		// ctx := context.WithValue(r.Context(), userLoaderKey, &userloader)
		// r = r.WithContext(ctx)
		// next.ServeHTTP(w, r)
	})
}

func getTrustlineLoader(ctx context.Context) *TrustlineLoader {
	return ctx.Value(trustlineLoaderKey).(*TrustlineLoader)
}

// func (r *Resolver) Todo_userLoader(ctx context.Context, obj *Todo) (*User, error) {
// 	return getUserLoader(ctx).Load(obj.UserID)
// }
