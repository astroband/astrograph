// default value from current network state
// it would be updated from real stellar-core database on the app init
let baseReserve = 5000000n;

export function setBaseReserve(newBaseReserve: bigint | number): void {
  baseReserve = BigInt(newBaseReserve);
}

export function getReservedBalance(numSubentries: number) {
  return baseReserve * (2n + BigInt(numSubentries));
}
