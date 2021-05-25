package arc

import (
	"sort"
	"strings"

	"github.com/agnivade/levenshtein"
)

type StringSet map[string]struct{}

type StringDistanceSortInterface struct {
	slice []string
	comp  string
}

func (s StringDistanceSortInterface) Len() int {
	return len(s.slice)
}

func (s StringDistanceSortInterface) Less(i, j int) bool {
	di := levenshtein.ComputeDistance(s.slice[i], s.comp)
	dj := levenshtein.ComputeDistance(s.slice[j], s.comp)
	return di < dj
}

func (s StringDistanceSortInterface) Swap(i, j int) {
	tmp := s.slice[i]
	s.slice[i] = s.slice[j]
	s.slice[j] = tmp
}

func (s StringSet) Add(str string) {
	s[str] = struct{}{}
}

func (s StringSet) AddSets(sets ...StringSet) {
	for _, set := range sets {
		for k, v := range set {
			s[k] = v
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
		if len(filter) > 0 {
			sort.Sort(StringDistanceSortInterface{
				slice: slice,
				comp:  filter,
			})
		} else {
			sort.Strings(slice)
		}
	}
	return slice
}
