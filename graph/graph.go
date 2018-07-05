//go:generate gorunpkg github.com/vektah/gqlgen -schema ../schema.graphql -typemap types.json

package graph

import (
	"sync"
	"context"
	log "github.com/sirupsen/logrus"
	"github.com/mobius-network/astrograph/db"
	"github.com/mobius-network/astrograph/model"
	"github.com/mobius-network/astrograph/dataloader"
)

type App struct {
	AccountChannels map[string]chan model.AccountEvent
	AccountCounters map[string]uint64
	mu              sync.Mutex
}

func (a *App) Account_data(ctx context.Context, obj *model.Account) ([]model.DataEntry, error) {
	loader := ctx.Value(dataloader.DataEntryLoaderKey).(*dataloader.DataEntrySliceLoader)
	dataEntries, error := loader.Load(obj.ID)
	return dataEntries, error

}

func (a *App) Account_trustlines(ctx context.Context, obj *model.Account) ([]model.TrustLine, error) {
	loader := ctx.Value(dataloader.TrustLineLoaderKey).(*dataloader.TrustLineSliceLoader)
	trustlines, error := loader.Load(obj.ID)
	return trustlines, error
}

func (a *App) Account_signers(ctx context.Context, obj *model.Account) ([]model.Signer, error) {
	loader := ctx.Value(dataloader.SignerLoaderKey).(*dataloader.SignerSliceLoader)
	signers, error := loader.Load(obj.ID)
	return signers, error
}

func (a *App) Query_Account(ctx context.Context, id string) (*model.Account, error) {
	return db.QueryAccount(id)
}

func (a *App) Query_Accounts(ctx context.Context, id []string) ([]model.Account, error) {
	sourceAccounts, err := db.QueryAccountsOrdered(id)

	if (err != nil) { return nil, err }

	accounts := make([]model.Account, 0)

	for _, account := range sourceAccounts {
		if account != nil {
			accounts = append(accounts, *account)
		}
	}

	return accounts, nil
}

func (a *App) Subscription_accountUpdated(ctx context.Context, id string) (<-chan model.AccountEvent, error) {
	a.mu.Lock()
	ch := a.AccountChannels[id]

	if ch == nil {
		log.WithFields(log.Fields{"id": id}).Debug("Subscribed")

		ch = make(chan model.AccountEvent, 1)
		a.AccountCounters[id] = 1
		a.AccountChannels[id] = ch
	} else {
		log.WithFields(log.Fields{"id": id}).Debug("Already subscribed, skipping")
		a.AccountCounters[id]++
	}
	a.mu.Unlock()

	go func() {
		<-ctx.Done()
		a.mu.Lock()
		a.AccountCounters[id]--
		log.WithFields(log.Fields{"id": id, "counter": a.AccountCounters[id]}).Debug("Unsubscribed")
		if a.AccountCounters[id] <= 0 {
			delete(a.AccountChannels, id)
		}
		a.mu.Unlock()
	}()

	return ch, nil
}

func (a *App) SendAccountUpdates(id []string, accounts []*model.Account) {
	a.mu.Lock()
	for n, i := range id {
		account := accounts[n]

		ch := a.AccountChannels[i]
		if ch == nil {
			log.WithFields(log.Fields{"id": i}).Debug("Subscription not found")
			continue
		}

		if account == nil {
			a.sendDelete(ch, i)
		} else {
			a.sendUpdate(ch, account)
		}
	}
	a.mu.Unlock()
}

func (a *App) sendUpdate(ch chan model.AccountEvent, account *model.Account) {
	log.WithFields(log.Fields{"id": account.ID}).Debug("Sending updates")

	ch <- model.AccountEvent {
		Type: model.AccountEventTypeUpdate,
		Account: *account,
	}
}

func (a *App) sendDelete(ch chan model.AccountEvent, id string) {
	log.WithFields(log.Fields{"id": id}).Debug("Sending delete event")

	ch <- model.AccountEvent {
		Type: model.AccountEventTypeDelete,
		Account: model.Account{ID: id},
	}
}
