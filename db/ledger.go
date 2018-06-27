package db

import(
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
