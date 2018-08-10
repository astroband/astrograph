import db from "../database";

const dataEntryResolver = {
  Query: {
    dataEntries(root: any, args: any, ctx: any, info: any) {
      return db.dataEntries.findAllByAccountID(args.id);
    }
  }
};

export { dataEntryResolver };
