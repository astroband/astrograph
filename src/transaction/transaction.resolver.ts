import db from "../database";

const transactionResolver = {
  Query: {
    transaction(root: any, args: any, ctx: any, info: any) {
      return db.transactions.findByID(args.id);
    },

    transactionsByLedgerSeq(root: any, args: any, ctx: any, info: any) {
      return db.transactions.findAllBySeq(args.ledgerSeq);
    }
  }
};

export { transactionResolver };
