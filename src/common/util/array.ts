// [].filter(compact)
export function compact(value: any): boolean {
  return value !== null && value !== undefined;
}

// [].kindOf(ofType<Account>())
export function kindOf(kind: string): any {
  return (value: any) => value.kind === kind;
}

// [].filter(unique)
export function unique(value: any, index: number, self: any): boolean {
  return self.indexOf(value) === index;
}

// joinToMap<string, Account>(ids, accounts) => Map<string, Account>
export function joinToMap<K, T>(keys: K[], values: Array<T | null>): Map<K, T> {
  const map = new Map<K, T>();

  keys.forEach((key, n) => {
    if (values[n]) {
      map.set(key, values[n] as T);
    }
  });

  return map;
}


// // rearrangeFlat<string, Account>(ids, res, Account, (id: string, v: any) => v.accountid === id);
// export function rearrangeFlat<K, T>(
//   keys: K[],
//   values: T[],
//   findFn: any
// ): Array<T | null> {
//   return
//   return keys.map(key => values.find(v => findFn(key, v) || null);
// }
// const rearrange = (id: string) => {
//   const a = res.find(r => r.accountid === id);
//   if (a) {
//     return new Account(a);
//   }
//   return null;
// };
//
// return ids.map(rearrange);
