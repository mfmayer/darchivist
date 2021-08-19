package arc

import (
	"os"
	"testing"

	"github.com/agnivade/levenshtein"
)

func TestLevenstein(t *testing.T) {
	di := levenshtein.ComputeDistance("matth", "Date")
	dj := levenshtein.ComputeDistance("matth", "matthias")
	t.Logf("%v - %v", float32(di)/4, float32(dj)/8)
}

func TestTags(t *testing.T) {
	archive := NewArchive(os.Getenv("DARCHIVE_PATH"))
	t.Logf("path: %v", archive.Path())
	//tags, _ := archive.find("", []string{"Versicherung", "Allianz"})
	vs, _ := archive.find("matth", []string{})
	for _, v := range vs[:10] {
		t.Logf("\"%v\"", v)
	}
}

func TestFiles(t *testing.T) {
	archive := NewArchive(os.Getenv("DARCHIVE_PATH"))
	t.Logf("path: %v", archive.Path())
	_, files := archive.find("Konto", []string{"Versicherung"})
	for _, file := range files {
		t.Logf("\"%v\"", file)
	}
}

func TestStringSet(t *testing.T) {
	// tags := StringSet{}
	// tags.Add("Küche")
	// tags.Add("Kueche")
	// tags.Add("Wohnzimmer")
	//t.Log(tags.Slice("ü", language.German, true))
	// t.Log(tags.Slice(WithContainsFilter("ü", language.German), WithStringDistanceSort("ü")))
}
