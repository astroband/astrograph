// Returns prev transactions within ledger.
//
// We assume that all ledgers are ingested in full, including all underlying transactions, operations
// and all other entities.
//
// prevTree finds previous lastest transaction within linked list of ledgers and ensures the chain is
// consistent. For example, if you have ingested ledgers 100-200 and then decide to ingest ledgers 500-600,
// first transaction from ledger 500 should have blank previous transaction because it is missing in database.
//
// `depth` sets the maximum number of ledgers in row containing zero transactions.
//
query context($id: string, $ledger: string) {
  prevTree(func: uid($ledger), orderdesc: seq) @recurse(depth: 20, loop: true) {
    uid
    index
    seq

    transactions(orderdesc: index) {
      uid
      index
    }

    prev
  }

  private findPrevTransaction(prevTree: any) {
    const match = (tx: any) => {
      const sameLedger = tx.seq === this.tx.ledgerSeq;
      const prevIndex = tx.index === this.tx.index - 1;

      return (sameLedger && prevIndex) || !sameLedger;
    };

    return new RecurseIterator(prevTree, "prev", "transactions").find((txs: any) => txs.find(match));
  }
