import { DgraphClientStub, DgraphClient, Operation, Mutation } from "dgraph-js";
import { Ledger } from "./model";
import { Collection, Ingestor } from "./ingest";
import grpc from "grpc";
import logger from "./common/util/logger";

const clientStub = new DgraphClientStub("localhost:9080", grpc.credentials.createInsecure());
const client = new DgraphClient(clientStub);

const dropAll = async () => {
  const op = new Operation();
  op.setDropAll(true);
  await client.alter(op);
}

const setSchema = async () => {
  const schema = `
    type: string @index(exact) .
    seq: int @index(int) .
  `;
  const op = new Operation();
  op.setSchema(schema);
  await client.alter(op);
}

type Cache = Map<string, any>;

const init = async () => {
  await dropAll();
  await setSchema();

  const cache: Cache = new Map<string, any>();

  const ingest = await Ingestor.build(9218694, (ledger: Ledger, collection: Collection) => {
    new Builder(ledger, collection, cache).publish();
  });

  const interval = 500;
  logger.info(`Staring dgraph ingest every ${interval} ms.`);

  setInterval(() => ingest.tick(), interval);
}

class Builder {
  private ledger: Ledger;
  private collection: Collection;
  private cache: Cache;

  constructor(ledger: Ledger, collection: Collection, cache: Cache) {
    this.ledger = ledger;
    this.collection = collection;
    this.cache = cache;
  }

  public publish() {
    this.publishLedger();
    this.publishAccounts();
  }

  public async publishAccounts() {
    
  }

  public async publishLedger() {
    const txn = client.newTxn();
    try {
      let nquads = `
        _:ledger <type> "ledger" .
        _:ledger <seq> "${this.ledger.ledgerSeq}" .
        _:ledger <version> "${this.ledger.ledgerVersion}" .
      `;

      const prevLedgerUID = this.cache.get("ledger");
      if (prevLedgerUID) {
        nquads = nquads.concat(`
          _:ledger <prev> <${prevLedgerUID}> .
          <${prevLedgerUID}> <next> _:ledger .
        `);
      }

      const mu = new Mutation();
      mu.setSetNquads(nquads);
      const assigned = await txn.mutate(mu);
      await txn.commit();

      this.cache.set("ledger", assigned.getUidsMap().get("ledger"));
    } finally {
      await txn.discard();
    }
  }
}

export default { init, Builder };

// // Create data using JSON.
// async function createData(dgraphClient) {
//     // Create a new transaction.
//     const txn = dgraphClient.newTxn();
//     try {
//         // Create data.
//         const p = {
//             name: "Alice",
//             age: 26,
//             married: true,
//             loc: {
//                 type: "Point",
//                 coordinates: [1.1, 2],
//             },
//             dob: new Date(1980, 1, 1, 23, 0, 0, 0),
//             friend: [
//                 {
//                     name: "Bob",
//                     age: 24,
//                 },
//                 {
//                     name: "Charlie",
//                     age: 29,
//                 }
//             ],
//             school: [
//                 {
//                     name: "Crown Public School",
//                 }
//             ]
//         };
//
//         // Run mutation.
//         const mu = new dgraph.Mutation();
//         mu.setSetJson(p);
//         const assigned = await txn.mutate(mu);
//
//         // Commit transaction.
//         await txn.commit();
//
//         const p1 = {
//           name: "Terminus",
//           age: 28,
//           friend: [
//             {
//               name: "Alice",
//               age: 26
//             }
//           ]
//         };
//
//         const txn1 = dgraphClient.newTxn();
//
//         const mu1 = new dgraph.Mutation();
//         mu1.setSetJson(p1);
//         await txn1.mutate(mu1);
//
//         await txn1.commit();
//         // Get uid of the outermost object (person named "Alice").
//         // Assigned#getUidsMap() returns a map from blank node names to uids.
//         // For a json mutation, blank node names "blank-0", "blank-1", ... are used
//         // for all the created nodes.
//         console.log(`Created person named "Alice" with uid = ${assigned.getUidsMap().get("blank-0")}\n`);
//
//         console.log("All created nodes (map from blank node names to uids):");
//         assigned.getUidsMap().forEach((uid, key) => console.log(`${key} => ${uid}`));
//         console.log();
//     } finally {
//         // Clean up. Calling this after txn.commit() is a no-op
//         // and hence safe.
//         await txn.discard();
//     }
// }
//
// // Query for data.
// async function queryData(dgraphClient) {
//     // Run query.
//     const query = `query all($a: string) {
//         all(func: eq(name, $a)) {
//             uid
//             name
//             age
//             married
//             loc
//             dob
//             friend {
//                 name
//                 age
//             }
//             school {
//                 name
//             }
//         }
//     }`;
//     const vars = { $a: "Alice" };
//     const res = await dgraphClient.newTxn().queryWithVars(query, vars);
//     const ppl = res.getJson();
//
//     // Print results.
//     console.log(`Number of people named "Alice": ${ppl.all.length}`);
//     ppl.all.forEach((person) => console.log(person));
// }

// async function main() {
//     const dgraphClientStub = newClientStub();
//     const dgraphClient = newClient(dgraphClientStub);
//     await dropAll(dgraphClient);
//     await setSchema(dgraphClient);
//     await createData(dgraphClient);
//     await queryData(dgraphClient);
//
//     // Close the client stub.
//     dgraphClientStub.close();
// }
//
// main().then(() => {
//     console.log("\nDONE!");
// }).catch((e) => {
//     console.log("ERROR: ", e);
// });
