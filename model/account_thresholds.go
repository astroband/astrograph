package model

type AccountThresholds struct {
	ID           string `json:"id"`
	MasterWeight int 		`json:"masterWeight"`
	Low          int 		`json:"low"`
	Medium       int 		`json:"medium"`
	High         int 		`json:"high"`
}
