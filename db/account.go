package db

import (
	b64 "encoding/base64"
	"gopkg.in/mgutz/dat.v1"
	"github.com/stellar/go/xdr"
	"github.com/mobius-network/astrograph/util"
	"github.com/mobius-network/astrograph/model"
	"github.com/mobius-network/astrograph/config"
)

// Returns single account or nil
func QueryAccount(id string) (*model.Account, error) {
	var account model.Account

	err := config.DB.
		Select("*").
		From("accounts").
		Where("accountid = $1", id).
		QueryStruct(&account)

	switch {
	case err == dat.ErrNotFound:
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

	err := config.DB.
		Select("*").
		From("accounts").
		Where("accountid IN $1", id).
		QueryStructs(&accounts)

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
	f := model.AccountFlags{
		AuthRequired: a.RawFlags & int(xdr.AccountFlagsAuthRequiredFlag) == 1,
		AuthRevokable: a.RawFlags & int(xdr.AccountFlagsAuthRevocableFlag) == 1,
		AuthImmutable: a.RawFlags & int(xdr.AccountFlagsAuthImmutableFlag) == 1,
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
