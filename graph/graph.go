//go:generate gorunpkg github.com/vektah/gqlgen -schema ../schema.graphql -typemap types.json

package graph

import (
	// "log"
	"sync"
	"context"
	"github.com/mobius-network/astrograph/db"
	"github.com/mobius-network/astrograph/util"
	"github.com/mobius-network/astrograph/model"
	"github.com/mobius-network/astrograph/dataloader"
)

type App struct {
	AccountChannels map[string]chan model.Account
	AccountCounters map[string]uint64
	mu              sync.Mutex
}

func (a *App) Account_trustlines(ctx context.Context, obj *model.Account) ([]model.Trustline, error) {
	loader := ctx.Value(dataloader.TrustlineLoaderKey).(*dataloader.TrustlineLoader)
	trustlines, errors := loader.LoadAll([]string{obj.ID})

	for _, e := range errors {
		if e != nil {
			return nil, e
		}
	}

	result := make([]model.Trustline, 0)
	if (trustlines[0] == nil) {
		return nil, nil
	}

	for _, t := range trustlines[0] {
		if (t != nil) {
			result = append(result, *t)
		}
	}

	return result, nil
}

func (a *App) Query_Account(ctx context.Context, id string) (*model.Account, error) {
	return db.QueryAccount(id)
}

func (a *App) Query_Accounts(ctx context.Context, id []string) ([]model.Account, error) {
	sourceAccounts, err := db.QueryAccounts(id)

	if (err != nil) { return nil, err }

	accounts := make([]model.Account, 0)

	for _, account := range sourceAccounts {
		accounts = append(accounts, *account)
	}

	return accounts, nil
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
		if a.AccountCounters[id] <= 0 {
			delete(a.AccountChannels, id)
		}
		a.mu.Unlock()
	}()

	return ch, nil
}

func (a *App) SendAccountUpdates(accounts []*model.Account) {
	a.mu.Lock()
	for _, account := range accounts {
		ch := a.AccountChannels[account.ID]
		if ch == nil {
			util.LogDebug(account.ID, "subscription not found")
			continue
		}
		util.LogDebug("Sending updates to", account.ID)

		ch <- *account
	}
	a.mu.Unlock()
}
