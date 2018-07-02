package db

import (
	"database/sql"
	sq "github.com/Masterminds/squirrel"
	"github.com/mobius-network/astrograph/model"
	"github.com/mobius-network/astrograph/config"
)

// Returns number of maximum ledger in database
func FetchMaxLedger() (uint64, error) {
	var seq uint64

	q, args, err := bLedgers.OrderBy("ledgerseq DESC").Limit(1).ToSql()
	if (err != nil) { return 0, err }

	err = config.DB.Get(&seq, q, args...)
	if (err != nil) { return 0, err }

	return seq, err
}

// Returns true if specified ledger exist in database
func LedgerExist(seq uint64) (bool, error) {
  var newSeq uint64

	q, args, err := bLedgers.Where(sq.Eq{"ledgerseq": seq}).ToSql()
	if (err != nil) { return false, err }

	err = config.DB.Get(&newSeq, q, args...)
	if err == sql.ErrNoRows {
		return false, nil
	} else if err != nil {
		return false, err
	}

	return true, nil
}

// Returns account ids of accounts changed in this ledger
func QueryLedgerUpdatedAccountID(seq uint64) ([]string, error) {
  accountId, err := fetchUpdatedAccountIDs("accounts", seq)
  if (err != nil) { return nil, err }

  accountDataId, err := fetchUpdatedAccountIDs("accountdata", seq)
  if (err != nil) { return nil, err }

  trustlineId, err := fetchUpdatedAccountIDs("trustlines", seq)
  if (err != nil) { return nil, err }

  id := append(accountId, trustlineId...)
  id = append(id, accountDataId...)

	err = fetchLedgerTransactions(seq)

  return id, nil
}

func fetchLedgerTransactions(seq uint64) error {
	var tx []model.Transaction

	q, args, err := b.Select("*").From("txhistory").Where(sq.Eq{"ledgerseq": seq}).OrderBy("txindex").ToSql()
	if (err != nil) { return err }

	err = config.DB.Select(&tx, q, args...)
	if (err != nil) { return err }

	for _, t := range tx {
		t.DecodeRaw()
	}

	return nil
}

func fetchUpdatedAccountIDs(tableName string, seq uint64) ([]string, error) {
  var id []string

	q, args, err := b.Select("accountid").From(tableName).Where(sq.Eq{"lastmodified": seq}).ToSql()
	if err != nil { return nil, err }

	err = config.DB.Select(&id, q, args...)
	if err != nil { return nil, err }

  return id, nil
}
