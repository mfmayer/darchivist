package arc

import (
	"sort"

	"github.com/agnivade/levenshtein"
	"golang.org/x/text/language"
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

type sliceOption struct {
	//filter                 string
	//languageTag            language.Tag
	containsFilter         func(s string) bool
	sortedByStringDistance string
}

type SliceOption func(*sliceOption)

func WithContainsFilter(filter string, languageTag language.Tag) SliceOption {
	return func(so *sliceOption) {
		if filter != "" {
			so.containsFilter = containsFunc(filter, languageTag)
		}
	}
}

func WithStringDistanceSort(comp string) SliceOption {
	return func(so *sliceOption) {
		if comp != "" {
			so.sortedByStringDistance = comp
		}
	}
}

// Slice the map and return filtered/sorted slice
//func (s StringSet) Slice(filter string, languageTag language.Tag, sorted bool) []string {
func (s StringSet) Slice(opts ...SliceOption) []string {
	so := &sliceOption{
		containsFilter:         nil,
		sortedByStringDistance: "",
	}
	for _, opt := range opts {
		opt(so)
	}
	slice := make([]string, len(s))
	{
		i := 0
		for str := range s {
			if so.containsFilter != nil {
				if !so.containsFilter(str) {
					continue
				}
			}
			slice[i] = str
			i++
		}
		slice = slice[:i]
	}
	if so.sortedByStringDistance != "" {
		if len(so.sortedByStringDistance) > 0 {
			sort.Sort(StringDistanceSortInterface{
				slice: slice,
				comp:  so.sortedByStringDistance,
			})
		}
	} else {
		sort.Strings(slice)
	}
	return slice
}
