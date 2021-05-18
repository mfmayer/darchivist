package arc

import (
	"sort"
	"strings"
)

type StringSet map[string]struct{}

func (s StringSet) Add(str string) {
	s[str] = struct{}{}
}

func (s StringSet) AddSets(sets ...StringSet) {
	for _, set := range sets {
		if set != nil {
			for k, v := range set {
				s[k] = v
			}
		}
	}
}

func (s StringSet) Slice(filter string, sorted bool) []string {
	slice := make([]string, len(s))
	{
		i := 0
		for str := range s {
			if filter != "" {
				if !strings.Contains(str, filter) {
					continue
				}
			}
			slice[i] = str
			i++
		}
		slice = slice[:i]
	}
	if sorted {
		sort.Strings(slice)
	}
	return slice
}
