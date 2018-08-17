// [].filter(compact)
export function compact(value: any): boolean {
  return value !== null;
}

// [].filter(ofType<Account>())
export function kindOf(key: string): any {
  return (value: any) => value.kind === key
}

// [].filter(unique)
export function unique(value: any, index: number, self: any): boolean {
  return self.indexOf(value) === index;
}
