package db

import(
  "log"
  "github.com/mobius-network/astrograph/config"
)

func FetchMaxLedger() uint64 {
	var seq uint64

	row := config.Db.QueryRow(selectMaxLedger)
	err := row.Scan(&seq)
	if err != nil { log.Fatal(err) }

	return seq
}
