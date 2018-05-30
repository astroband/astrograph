//go:generate gorunpkg github.com/vektah/gqlgen -schema ../schema.graphql -typemap types.json

package graph

import (
	"log"
	"sync"
	"context"
	"github.com/mobius-network/astrograph/db"
	"github.com/mobius-network/astrograph/util"
	"github.com/mobius-network/astrograph/model"
	"github.com/mobius-network/astrograph/config"
)

type App struct {
	AccountChannels map[string]chan model.Account
	AccountCounters map[string]uint64
	mu       		    sync.Mutex
}

func (a *App) Query_Account(ctx context.Context, id string) (*model.Account, error) {
	return db.QueryAccount(id)
}

func (a *App)	Query_Accounts(ctx context.Context, id []string) ([]model.Account, error) {
  return db.QueryAccounts(id)
}

func (a *App) Account_trustlines(ctx context.Context, obj *model.Account) ([]model.Trustline, error) {
	r := make([]model.Trustline, 1)

  rows, err := config.Db.Query(`
    SELECT
      assettype,
      issuer,
      assetcode,
      tlimit,
      balance,
      flags,
      lastmodified
    FROM trustlines
    WHERE accountid = $1
		ORDER BY assettype, assetcode`, obj.ID)

  if (err != nil) { log.Fatal(err) }

  defer rows.Close()
  for rows.Next() {
    t := model.Trustline{}

    err := rows.Scan(
      &t.Assettype,
      &t.Issuer,
      &t.Assetcode,
      &t.Tlimit,
      &t.Balance,
      &t.Flags,
      &t.Lastmodified,
    )

    if (err != nil) {
      log.Fatal(err)
    }

    r = append(r, t)
  }

  return r, nil
}

func (a *App) Subscription_accountUpdated(ctx context.Context, id string) (<-chan model.Account, error) {
	a.mu.Lock()
	ch := a.AccountChannels[id]

	if ch == nil {
		util.LogDebug(id, "subscribed")

		ch = make(chan model.Account, 1)
		a.AccountCounters[id] = 1
		a.AccountChannels[id] = ch
	} else {
		util.LogDebug(id, "already has subscription")
		a.AccountCounters[id]++
	}
	a.mu.Unlock()

	go func() {
		<-ctx.Done()
		util.LogDebug(id, "unsubscribed")
		a.mu.Lock()
		a.AccountCounters[id]--
		util.LogDebug("Counter for", id, "is", a.AccountCounters[id])
		if (a.AccountCounters[id] <= 0) {
			delete(a.AccountChannels, id)
		}
		a.mu.Unlock()
	}()

	return ch, nil
}

func (a *App) SendAccountUpdates(accounts []model.Account) {
  a.mu.Lock()
  for _, account := range accounts {
		ch := a.AccountChannels[account.ID]
		if (ch == nil) {
			util.LogDebug(account.ID, "subscription not found")
			continue
		}
		util.LogDebug("Sending updates to", account.ID)

		ch <- account
  }
	a.mu.Unlock()
}
