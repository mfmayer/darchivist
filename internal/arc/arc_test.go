package arc

import (
	"os"
	"testing"

	"golang.org/x/text/language"
)

func TestTags(t *testing.T) {
	archive := NewArchive(os.Getenv("DARCHIVE_PATH"))
	t.Logf("path: %v", archive.Path())
	//tags, _ := archive.find("", []string{"Versicherung", "Allianz"})
	tags, _ := archive.find("", []string{})
	for _, tag := range tags {
		t.Logf("\"%s\"", tag)
	}
}

func TestFiles(t *testing.T) {
	archive := NewArchive(os.Getenv("DARCHIVE_PATH"))
	t.Logf("path: %v", archive.Path())
	_, files := archive.find("Konto", []string{"Versicherung"})
	for _, file := range files {
		t.Logf("\"%s\"", file)
	}
}

func TestStringSet(t *testing.T) {
	tags := StringSet{}
	tags.Add("Küche")
	tags.Add("Kueche")
	tags.Add("Wohnzimmer")
	//t.Log(tags.Slice("ü", language.German, true))
	t.Log(tags.Slice(WithContainsFilter("ü", language.German), WithStringDistanceSort("ü")))
}
