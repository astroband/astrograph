package ingest

import (
  "log"
  "strings"
  "database/sql"
  "github.com/mobius-network/astrograph/util"
  "github.com/mobius-network/astrograph/graph"
  "github.com/mobius-network/astrograph/config"
)

type Core struct {
  LedgerSeq uint64
}

func NewCore () *Core {
  c := new(Core)
  c.LedgerSeq = c.FetchMaxLedger() + 1
  return c
}

// Fetches maximum current ledger number
func (c *Core) FetchMaxLedger() (uint64) {
  var seq uint64

  row := config.Db.QueryRow("SELECT ledgerseq FROM ledgerheaders ORDER BY ledgerseq DESC LIMIT 1")
  err := row.Scan(&seq)
  if err != nil { log.Fatal(err) }

  return seq
}

// Checks if current ledger is populated
func (c *Core) checkLedgerExist() (bool) {
  row := config.Db.QueryRow("SELECT ledgerseq FROM ledgerheaders WHERE ledgerseq = $1", c.LedgerSeq)
  err := row.Scan(&c.LedgerSeq)

  // If current ledger does not exist and is less than max ledger (meaning there is a gap in history), rewinds
  // to the head.
  //
  // NOTE: Might need to send updates to all subscriptions in this case.
  if (err == sql.ErrNoRows) {
    newSeq := c.FetchMaxLedger()
    if (c.LedgerSeq < newSeq) { c.LedgerSeq = newSeq }
    return false
  } else if (err != nil) {
    log.Fatal(err)
  }

  return true
}

// Loads updated account ids from given table (accounts, trustlines, data entries in future)
func (c *Core) loadUpdatesFrom(tableName string) ([]string) {
  var a []string = make([]string, 0)
  var id string

  rows, err := config.Db.Query("SELECT accountid FROM " + tableName + " WHERE lastmodified = $1", c.LedgerSeq)
  if (err != nil) {
    log.Fatal(err)
  }
  defer rows.Close()

  for rows.Next() {
    err := rows.Scan(&id)
    if err != nil { log.Fatal(err) }
    a = append(a, id)
  }

  return a
}

// Loads accounts with given ids
func (c *Core) loadAccounts(id []string) ([]graph.Account) {
  r := make([]graph.Account, 0)

  if (len(id) == 0) { return r }

  rows, err := config.Db.Query(`
    SELECT
      accountid,
      balance,
      seqnum,
      numsubentries,
      inflationdest,
      homedomain,
      thresholds,
      flags,
      lastmodified
    FROM accounts
    WHERE accountid IN ('` + strings.Join(id, "', '") + "')")

  if (err != nil) { log.Fatal(err) }

  defer rows.Close()
  for rows.Next() {
    a := graph.Account{}
    err := rows.Scan(
      &a.ID,
      &a.Balance,
      &a.Seqnum,
      &a.Numsubentries,
      &a.Inflationdest,
      &a.Homedomain,
      &a.Thresholds,
      &a.Flags,
      &a.Lastmodified,
    )

    if (err != nil) {
      log.Fatal(err)
    }

    r = append(r, a)
  }

  if err = rows.Err(); err != nil {
    log.Fatal(err)
  }

  return r
}

// Loads updates from current ledger
func (c *Core) Pull() (accounts []graph.Account) {
  log.Println("Ingesting ledger", c.LedgerSeq)

  if (!c.checkLedgerExist()) { return }
  id := append(c.loadUpdatesFrom("accounts"), c.loadUpdatesFrom("trustlines")...)
  id = util.UniqueStringSlice(id)

  util.LogDebug("Updated accounts & trustlines:", id)
  log.Println("Updated", len(id), "accounts & trustlines")

  r := c.loadAccounts(id)

  c.LedgerSeq += 1

  return r
}
