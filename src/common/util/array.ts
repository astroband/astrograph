// [].filter(compact)
export function compact(value: any): boolean {
  return value !== null;
}

// [].filter(ofType<Account>())
export function ofType<T>(): any {
  return (value: any): boolean => {
    if (value as T) {
      return true;
    }

    return false;
  }
}

// [].filter(unique)
export function unique(value: any, index: number, self: any): boolean {
  return self.indexOf(value) === index;
}
