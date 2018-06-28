package model

type AccountFlags struct {
	ID            string `json:"id"`
	AuthRequired  bool 	 `json:"authRequired"`
	AuthRevokable bool   `json:"authRevokable"`
	AuthImmutable bool   `json:"authImmutable"`
}
