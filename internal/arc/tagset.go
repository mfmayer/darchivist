package arc

import (
	"sort"

	"github.com/agnivade/levenshtein"
	"github.com/mfmayer/darchivist/internal/api"
	"golang.org/x/text/language"
)

type StringSet map[string]struct{}

func (s StringSet) Slice() []string {
	keys := make([]string, len(s))
	i := 0
	for k := range s {
		keys[i] = k
		i++
	}
	return keys
}

type TagSet map[string]*api.Tag

type TagSorter struct {
	slice []*api.Tag
	// comp  string
	less func(i, j *api.Tag) bool
}

func NewTagSorter(lessFunc func(i, j *api.Tag) bool, tagSlice []*api.Tag) *TagSorter {
	return &TagSorter{
		slice: tagSlice,
		less:  lessFunc,
	}
}

func (ts TagSorter) Len() int {
	return len(ts.slice)
}

func (ts TagSorter) Less(i, j int) bool {
	iTag := ts.slice[i]
	jTag := ts.slice[j]
	if iTag.Selected && !jTag.Selected {
		return true
	} else if jTag.Selected && !iTag.Selected {
		return false
	}
	return ts.less(iTag, jTag)
	// di := levenshtein.ComputeDistance(ts.slice[i].Name, ts.comp)
	// dj := levenshtein.ComputeDistance(ts.slice[j].Name, ts.comp)
	// return di < dj
}

func (ts TagSorter) Swap(i, j int) {
	tmp := ts.slice[i]
	ts.slice[i] = ts.slice[j]
	ts.slice[j] = tmp
}

// AddSelected
func (ts TagSet) AddSelectedTags(str ...string) {
	ts.AddTags(str...)
	for _, tagStr := range str {
		ts[tagStr].Selected = true
	}
}

func (ts TagSet) AddFileTags(str ...string) {
	ts.AddTags(str...)
	for _, tagStr := range str {
		ts[tagStr].FileCount += 1
	}
}

func (ts TagSet) AddTags(str ...string) {
	for _, tagStr := range str {
		_, ok := ts[tagStr]
		if !ok {
			tag := &api.Tag{
				Name: tagStr,
			}
			ts[tagStr] = tag
		}
	}
}

// func (s TagSet) AddSets(sets ...StringSet) {
// 	for _, set := range sets {
// 		for k, v := range set {
// 			s[k] = v
// 		}
// 	}
// }

type sliceOption struct {
	//filter                 string
	//languageTag            language.Tag
	containsFilter  func(s string) bool
	sortingLessFunc func(i, j *api.Tag) bool
	// sortedByStringDistance string
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
			so.sortingLessFunc = func(i *api.Tag, j *api.Tag) bool {
				di := levenshtein.ComputeDistance(i.Name, comp)
				dj := levenshtein.ComputeDistance(j.Name, comp)
				return float32(di)/float32(len(i.Name)) < float32(dj)/float32(len(j.Name))
			}
		}
	}
}

// Slice the map and return filtered/sorted slice
//func (s StringSet) Slice(filter string, languageTag language.Tag, sorted bool) []string {
func (ts TagSet) Slice(opts ...SliceOption) []*api.Tag {
	so := &sliceOption{
		containsFilter: nil,
		sortingLessFunc: func(i, j *api.Tag) bool {
			return i.Name < j.Name
		},
		// sortedByStringDistance: "",
	}
	for _, opt := range opts {
		opt(so)
	}
	slice := make([]*api.Tag, len(ts))
	{
		i := 0
		for _, tag := range ts {
			if !tag.Selected && so.containsFilter != nil {
				if !so.containsFilter(tag.Name) {
					continue
				}
			}
			slice[i] = tag
			i++
		}
		slice = slice[:i]
	}
	if so.sortingLessFunc != nil {
		sort.Sort(NewTagSorter(so.sortingLessFunc, slice))
		// sort.Sort(TagSorter{
		// 	slice: slice,
		// 	comp:  so.sortedByStringDistance,
		// })
	}
	return slice
}
