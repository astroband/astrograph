import _ from "lodash";
import { Client as ElasticClient } from "@elastic/elasticsearch";
import { withFilter } from "graphql-subscriptions";
import { Asset } from "stellar-base";
import { IHorizonOperationData } from "../../datasource/types";
import { IApolloContext } from "../../graphql_server";
import { Operation, OperationType, Transaction } from "../../model";
import { AssetFactory, OperationFactory, TransactionWithXDRFactory } from "../../model/factories";
import { NEW_OPERATION, pubsub } from "../../pubsub";
import { makeConnection } from "./util";

import * as resolvers from "./shared";
import * as secrets from "../../util/secrets";

export default {
  Operation: {
    sourceAccount: resolvers.account,
    transaction: async (operation: Operation, args: any, ctx: IApolloContext) => {
      if (operation.tx instanceof Transaction) {
        return operation.tx;
      }

      const records = await ctx.dataSources.transactions.byIds([operation.tx.id]);
      return TransactionWithXDRFactory.fromHorizon(records[0]);
    },
    __resolveType(operation: Operation) {
      switch (operation.type) {
        case OperationType.Payment:
          return "PaymentOperation";
        case OperationType.SetOption:
          return "SetOptionsOperation";
        case OperationType.AccountMerge:
          return "AccountMergeOperation";
        case OperationType.AllowTrust:
          return "AllowTrustOperation";
        case OperationType.BumpSequence:
          return "BumpSequenceOperation";
        case OperationType.ChangeTrust:
          return "ChangeTrustOperation";
        case OperationType.CreateAccount:
          return "CreateAccountOperation";
        case OperationType.ManageData:
          return "ManageDatumOperation";
        case OperationType.ManageSellOffer:
          return "ManageSellOfferOperation";
        case OperationType.ManageBuyOffer:
          return "ManageBuyOfferOperation";
        case OperationType.CreatePassiveSellOffer:
          return "CreatePassiveSellOfferOperation";
        case OperationType.PathPayment:
          return "PathPaymentOperation";
      }

      return null;
    }
  },
  PaymentOperation: { destination: resolvers.account },
  SetOptionsOperation: { inflationDestination: resolvers.account },
  AccountMergeOperation: { destination: resolvers.account },
  AllowTrustOperation: { trustor: resolvers.account },
  CreateAccountOperation: { destination: resolvers.account },
  PathPaymentOperation: { destinationAccount: resolvers.account },
  SetOptionsSigner: { account: resolvers.account },
  Query: {
    operation: async (root: any, args: { id: string }, ctx: IApolloContext) => {
      const response = await ctx.dataSources.operations.byId(args.id);
      return OperationFactory.fromHorizon(response);
    },
    operations: async (root: any, args: any, ctx: IApolloContext) => {
      return makeConnection<IHorizonOperationData, Operation>(await ctx.dataSources.operations.all(args), r =>
        OperationFactory.fromHorizon(r)
      );
    },
    payments: async (root: any, args: any, ctx: IApolloContext) => {
      return makeConnection<IHorizonOperationData, Operation>(await ctx.dataSources.payments.all(args), r =>
        OperationFactory.fromHorizon(r)
      );
    },
    payment_totals: async(root: any, args: any, ctx: IApolloContext) => {
      const assetKey = AssetFactory.fromInput(args.asset).toString();
      const asset = { term: { "asset.key": assetKey } };
      const account = args.account ? { term: { account_id: args.account } } : undefined;

      let query = {
        size: 0,
        query: {
          bool: {
            must: _.compact([asset, account])
          }
        },
        aggs: {
          in: {
            filter: { range: { diff: { gt: 0 } } },
            aggs: { in_total: { sum: { field: "diff" } } }
          },
          out: {
            filter: { range: { diff: { lt: 0 } } },
            aggs: { out_total: { sum: { field: "diff" } } }
          }
        }
      };


      const client = new ElasticClient({ node: secrets.ELASTIC_URL });
      const { body: response } = await client.search({ index: "balance", body: query });

      return {
        in: response.aggregations.in.in_total.value,
        out: response.aggregations.out.out_total.value
      };
    }
  },
  Subscription: {
    operations: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(NEW_OPERATION),
        (payload: Operation, vars) => {
          if (vars.txSource && !vars.txSource.includes(payload.tx.sourceAccount)) {
            return false;
          }

          if (vars.opSource && !vars.opSource.includes(payload.sourceAccount)) {
            return false;
          }

          if (vars.type && !vars.type.includes(payload.type)) {
            return false;
          }

          if (vars.destination && !("destination" in payload && vars.destination.includes(payload.destination))) {
            return false;
          }

          if (vars.asset) {
            return Object.entries(payload).some(([key, value]) => {
              if (!(value instanceof Asset)) {
                return false;
              }

              return vars.asset.includes(value.toString());
            });
          }

          return true;
        }
      ),

      resolve(payload: any, args: any, ctx: IApolloContext, info: any) {
        return payload;
      }
    }
  }
};
