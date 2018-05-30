package graph

import (
	"log"
	"sync"
	"context"
	"github.com/mobius-network/astrograph/util"
	"github.com/mobius-network/astrograph/config"
)

type App struct {
	AccountChannels map[string]chan Account
	AccountCounters map[string]uint64
	mu       		    sync.Mutex
}

func (a *App) Query_Account(ctx context.Context, id *string) (*Account, error) {
	return nil, nil
}

func (a *App)	Query_Accounts(ctx context.Context, limit *int, skip *int, order *string) ([]Account, error) {
  return nil, nil
}

func (a *App) Account_trustlines(ctx context.Context, obj *Account) ([]Trustline, error) {
	r := make([]Trustline, 1)

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
    t := Trustline{}

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

func (a *App) Subscription_accountUpdated(ctx context.Context, id string) (<-chan Account, error) {
	a.mu.Lock()
	ch := a.AccountChannels[id]

	util.LogDebug("Searching for subscription", id, "...")

	if ch == nil {
		util.LogDebug("Creating subscription on", id, "...")

		ch = make(chan Account, 1)
		a.AccountCounters[id] = 1
		a.AccountChannels[id] = ch
	} else {
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

func (a *App) SendAccountUpdates(accounts []Account) {
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
