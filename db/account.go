package db

import (
	"database/sql"
	b64 "encoding/base64"
	"github.com/stellar/go/xdr"
	sq "github.com/Masterminds/squirrel"
	"github.com/mobius-network/astrograph/util"
	"github.com/mobius-network/astrograph/model"
	"github.com/mobius-network/astrograph/config"
)

// Returns single account or nil
func QueryAccount(id string) (*model.Account, error) {
	var account model.Account

	q, args, err := accountsSql.Where(sq.Eq{"accountid": id}).ToSql()
	if (err != nil) { return nil, err }

	err = config.DB.Get(&account, q, args...)

	switch {
	case err == sql.ErrNoRows:
		return nil, nil
	case err != nil:
		return nil, err
	default:
		populate(&account)
		return &account, nil
	}
}

// Returns a set of accounts by id
func QueryAccounts(id []string) ([]*model.Account, error) {
	var accounts []*model.Account

	q, args, err := accountsSql.Where(sq.Eq{"accountid": id}).ToSql()
	if err != nil { return nil, err }

	err = config.DB.Select(&accounts, q, args...)
	if err != nil { return nil, err }

	for _, a := range accounts {
		populate(a)
	}

	return accounts, nil
}

func populate(account *model.Account) {
	account.Balance = float64(account.RawBalance) / model.BalancePrecision
	account.Flags = flags(account)
	account.Thresholds = thresholds(account)
}

func flags(a *model.Account) model.AccountFlags {
	flags := xdr.AccountFlags(a.RawFlags)

	f := model.AccountFlags{
		AuthRequired:  flags & xdr.AccountFlagsAuthRequiredFlag != 0,
		AuthRevokable: flags & xdr.AccountFlagsAuthRevocableFlag != 0,
		AuthImmutable: flags & xdr.AccountFlagsAuthImmutableFlag != 0,
	}

	f.ID = util.SHA1(a.ID, "flags")

	return f
}

func thresholds(a *model.Account) model.AccountThresholds {
	t, err := b64.StdEncoding.DecodeString(a.RawThresholds)
	if (err != nil) { return model.AccountThresholds{} }

	tr := model.AccountThresholds{
		MasterWeight: int(t[xdr.ThresholdIndexesThresholdMasterWeight]),
		Low: int(t[xdr.ThresholdIndexesThresholdLow]),
		Medium: int(t[xdr.ThresholdIndexesThresholdMed]),
		High: int(t[xdr.ThresholdIndexesThresholdHigh]),
	}

	tr.ID = util.SHA1(a.ID, "thresholds")

	return tr
}
