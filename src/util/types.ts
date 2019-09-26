// if T = { foo: number; bar: string }, then
// RequireAtLeastOneProperty<T> will be { foo: number; bar?: string } | { foo?: number: bar: string },
// so it will accept objects with either `foo` or `bar`, or both properties, but
// it won't accept empty object
export type RequireAtLeastOneProperty<T> = {
  [K in keyof T]: Required<Pick<T, K>> & Partial<Pick<T, Exclude<keyof T, K>>>
}[keyof T]
