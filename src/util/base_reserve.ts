// default value from current network state
// it would be updated from real stellar-core database on the app init
let baseReserve = 5000000;

export function setBaseReserve(newBaseReserve: number): void {
  baseReserve = newBaseReserve;
}

export function getReservedBalance(numSubentries: number) {
  return (2 + numSubentries) * baseReserve;
}
