package db

import (
	"gopkg.in/mgutz/dat.v1"
	"github.com/mobius-network/astrograph/config"
)

// Returns number of maximum ledger in database
func FetchMaxLedger() (uint64, error) {
	var seq uint64

	err := config.DB.
    Select("ledgerseq").
    From("ledgerheaders").
    OrderBy("ledgerseq DESC").
    Limit(1).
    QueryScalar(&seq)

	return seq, err
}

// Returns true if specified ledger exist in database
func LedgerExist(seq uint64) (bool, error) {
  var newSeq uint64

  err := config.DB.
    Select("ledgerseq").
    From("ledgerheaders").
    Where("ledgerseq = $1", seq).
    QueryScalar(&newSeq)

	if err == dat.ErrNotFound {
		return false, nil
	} else if err != nil {
		return false, err
	}

	return true, nil
}

// Returns account ids of accounts changed in this ledger
func GetLedgerUpdatedAccountId(seq uint64) ([]string, error) {
  accountId, err := fetchUpdatedAccountId("accounts", seq)
  if (err != nil) { return nil, err }

  accountDataId, err := fetchUpdatedAccountId("accountdata", seq)
  if (err != nil) { return nil, err }

  trustlineId, err := fetchUpdatedAccountId("trustlines", seq)
  if (err != nil) { return nil, err }

  id := append(accountId, trustlineId...)
  id = append(id, accountDataId...)

  return id, nil
}

func fetchUpdatedAccountId(tableName string, seq uint64) ([]string, error) {
  var id []string

  err := config.DB.
    Select("accountid").
    From(tableName).
    Where("lastmodified = $1", seq).
    QuerySlice(&id)

  if (err != nil) { return nil, err }

  return id, nil
}
