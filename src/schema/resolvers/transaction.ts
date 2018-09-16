import axios from "axios";
import { HORIZON_URL } from "../../common/util/secrets";
import db from "../../database";
import { ledgerResolver } from "./util";

export default {
  Transaction: {
    ledger: ledgerResolver
  },
  Query: {
    transaction(root: any, args: any, ctx: any, info: any) {
      return db.transactions.findByID(args.id);
    },
    transactions(root: any, args: any, ctx: any, info: any) {
      return db.transactions.findAllByID(args.id);
    }
  },
  Mutation: {
    sendTransaction(xdr: string): any {
      return axios.post(`${HORIZON_URL}/transactions`, {
        params: {
          tx: xdr
        }
      });
    }
  }
};
