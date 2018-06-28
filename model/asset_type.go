package model

import(
	"io"
	"fmt"
	"strconv"
)

type AssetType string

const (
	AssetTypeNative     AssetType = "NATIVE"
	AssetTypeAlphanum4  AssetType = "ALPHANUM_4"
	AssetTypeAlphanum12 AssetType = "ALPHANUM_12"
)

func (e AssetType) IsValid() bool {
	switch e {
	case AssetTypeNative, AssetTypeAlphanum4, AssetTypeAlphanum12:
		return true
	}
	return false
}

func (e AssetType) String() string {
	return string(e)
}

func (e *AssetType) UnmarshalGQL(v interface{}) error {
	str, ok := v.(string)
	if !ok {
		return fmt.Errorf("enums must be strings")
	}

	*e = AssetType(str)
	if !e.IsValid() {
		return fmt.Errorf("%s is not a valid AssetType", str)
	}
	return nil
}

func (e AssetType) MarshalGQL(w io.Writer) {
	fmt.Fprint(w, strconv.Quote(e.String()))
}
