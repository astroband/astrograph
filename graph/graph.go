package graph

import (
	"fmt"
	"sync"
	"context"
)

type App struct {
	accounts []Account
	Channels map[string]chan Account
	mu       sync.Mutex
}

func (a *App) Query_Account(ctx context.Context, id *string) (*Account, error) {
	return nil, nil
}

func (a *App)	Query_Accounts(ctx context.Context, limit *int, skip *int, order *string) ([]Account, error) {
  return nil, nil
}

func (a *App) Account_trustlines(ctx context.Context, obj *Account) ([]Trustline, error) {
  return nil, nil
}

func (a *App) Subscription_accountChanged(ctx context.Context, id string) (<-chan Account, error) {
	a.mu.Lock()
	ch := a.Channels[id]
	if ch == nil {
		ch = make(chan Account, 1)
		a.Channels[id] = ch
	}
	a.mu.Unlock()

	go func() {
		<-ctx.Done()
		a.mu.Lock()
		delete(a.Channels, id)
		a.mu.Unlock()
	}()

	return ch, nil
}
