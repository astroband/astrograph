import { Network } from "stellar-base";
import db from "../../database";

async function setNetwork(): Promise<string> {
  const promise = db.storeState.getStellarNetworkPassphrase().then((networkPassphrase: string) => {
    Network.use(new Network(networkPassphrase));
    return networkPassphrase;
  });

  return promise;
}

export { setNetwork };
