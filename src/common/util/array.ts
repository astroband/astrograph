// [].filter(compact)
export function compact(value: any): boolean {
  return value !== null && value !== undefined;
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
