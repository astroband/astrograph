package graph

import (
	"context"
)

type App struct {
	accounts []Account
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
