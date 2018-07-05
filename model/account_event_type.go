package model

import(
	"io"
	"fmt"
	"strconv"
)

const (
	AccountEventTypeUpdate AccountEventType = "UPDATE"
	AccountEventTypeDelete AccountEventType = "DELETE"
)

func (e AccountEventType) IsValid() bool {
	switch e {
	case AccountEventTypeUpdate, AccountEventTypeDelete:
		return true
	}
	return false
}

func (e AccountEventType) String() string {
	return string(e)
}

func (e *AccountEventType) UnmarshalGQL(v interface{}) error {
	str, ok := v.(string)
	if !ok {
		return fmt.Errorf("enums must be strings")
	}

	*e = AccountEventType(str)
	if !e.IsValid() {
		return fmt.Errorf("%s is not a valid AccountEventType", str)
	}
	return nil
}

func (e AccountEventType) MarshalGQL(w io.Writer) {
	fmt.Fprint(w, strconv.Quote(e.String()))
}
