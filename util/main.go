package util

import (
	"log"
	"github.com/mobius-network/astrograph/config"
)

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

func LogDebug(v ...interface{}) {
	if (*config.Debug) {
		log.Println(v...)
	}
}
