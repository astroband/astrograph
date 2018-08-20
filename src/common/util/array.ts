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
  var map = new Map<K, T>();

  keys.forEach((key, n) => {
    if (values[n]) {
      map.set(key, values[n] as T);
    }
  });

  return map;
}
