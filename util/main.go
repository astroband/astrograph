package util

import (
	"log"
	"crypto/sha1"
	"encoding/hex"
	"github.com/mobius-network/astrograph/config"
)

// Ruby Array#uniq
func UniqueStringSlice(input []string) []string {
	u := make([]string, 0, len(input))
	m := make(map[string]bool)

	for _, val := range input {
		if _, ok := m[val]; !ok {
			m[val] = true
			u = append(u, val)
		}
	}

	return u
}

// Return sha1 hash of given string
func SHA1(values ...string) string {
  h := sha1.New()
	for _, value := range values {
		h.Write([]byte(value))
		h.Write([]byte("|"))
	}
  return hex.EncodeToString(h.Sum(nil))
}

// Logs debug message if --debug flag passed
func LogDebug(v ...interface{}) {
	if *config.Debug {
		log.Println(v...)
	}
}
