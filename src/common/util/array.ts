// [].filter(compact)
export function compact(value: any): boolean {
  return value !== null;
}

// [].filter(ofType<Account>())
export function ofType<T>(field: string): any {
  return (value: any): boolean => {
    if ((value as T)[field]) {
      return true;
    }

    return false;
  };
}

// [].filter(unique)
export function unique(value: any, index: number, self: any): boolean {
  return self.indexOf(value) === index;
}
