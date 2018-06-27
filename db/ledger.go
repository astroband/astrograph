package db

import (
	"database/sql"
	"github.com/mobius-network/astrograph/config"
)

// Returns number of maximum ledger in database
func FetchMaxLedger() (uint64, error) {
	var seq uint64

	row := config.Db.QueryRow(selectMaxLedger)
	err := row.Scan(&seq)

	return seq, err
}

// Returns true if specified ledger exist in database
func LedgerExist(seq uint64) (bool, error) {
	var newSeq uint64

	row := config.Db.QueryRow(selectLedger, seq)
	err := row.Scan(&newSeq)

	if err == sql.ErrNoRows {
		return false, nil
	} else if err != nil {
		return false, err
	}

	return true, nil
}

// Returns account ids of accounts changed in this ledger
func GetLedgerUpdatedAccountId(seq uint64) ([]string, error) {
  accountId, err := updatedAccountId("accounts", seq)
  if (err != nil) { return nil, err }

  accountDataId, err := updatedAccountId("accountdata", seq)
  if (err != nil) { return nil, err }

  trustlineId, err := updatedAccountId("trustlines", seq)
  if (err != nil) { return nil, err }

  id := append(accountId, trustlineId...)
  id = append(id, accountDataId...)

  return id, nil
}


func updatedAccountId(tableName string, seq uint64) ([]string, error) {
	var a []string = make([]string, 0)
	var id string

	rows, err := config.Db.Query(selectUpdatedAccount + tableName + whereUpdatedAccount, seq)
	if err != nil { return nil, err }
	defer rows.Close()

	for rows.Next() {
		err := rows.Scan(&id)
		if err != nil { return nil, err }
		a = append(a, id)
	}

	return a, nil
}
