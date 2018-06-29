package model

// Amounts are divided by this value to float conversion
const BalancePrecision = 10000000

type HasRawFields interface {
  DecodeRaw()
}
