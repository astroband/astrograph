package ingest

import (
	log "github.com/sirupsen/logrus"
	"github.com/mobius-network/astrograph/db"
	"github.com/mobius-network/astrograph/util"
	"github.com/mobius-network/astrograph/model"
	"github.com/mobius-network/astrograph/config"
)

type Core struct {
	LedgerSeq uint64
}

// Constructor
func NewCore() *Core {
	c := new(Core)

	if (*config.StartLedger != 0) {
		c.LedgerSeq = *config.StartLedger
	} else {
		seq, err := db.FetchMaxLedger()
		if err != nil { log.Fatal(err) }
		c.LedgerSeq = seq + 1
	}

	return c
}

// Checks if current ledger is populated
func (c *Core) checkLedgerExist() bool {
	exist, _ := db.LedgerExist(c.LedgerSeq)

	// If current ledger does not exist and is less than max ledger (meaning there is a gap in history), fast-forwards
	// to the head.
	//
	// NOTE: Might need to send updates to all subscriptions in this case.
	if !exist {
		newSeq, err := db.FetchMaxLedger()
		if (err != nil) { log.Fatal(err) }

		if c.LedgerSeq < newSeq {
			c.LedgerSeq = newSeq
		}
		return false
	}

	return true
}

// Loads accounts with given ids
func (c *Core) loadAccounts(id []string) []*model.Account {
	r, err := db.QueryAccounts(id)
	if err != nil { log.Fatal(err) }
	return r
}

// Loads updates from current ledger
func (c *Core) Pull() (accounts []*model.Account) {
	if !c.checkLedgerExist() { return nil }

	log.WithFields(log.Fields{"LedgerSeq": c.LedgerSeq}).Info("Ingesting ledger")

	id, err := db.GetLedgerUpdatedAccountId(c.LedgerSeq)
	if (err != nil) { log.Fatal(err) }
	id = util.UniqueStringSlice(id)

	log.WithFields(log.Fields{"id": id}).Info("Accounts updated")

	r := c.loadAccounts(id)

	c.LedgerSeq += 1

	return r
}
