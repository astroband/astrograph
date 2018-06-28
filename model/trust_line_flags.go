package model

type TrustlineFlags struct {
  ID				 string `json:"id"`
  Authorized bool   `json:"authorized" db:"-"`
}
