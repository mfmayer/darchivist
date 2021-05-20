package arc

import (
	"os"
	"testing"
)

func TestTags(t *testing.T) {
	archive := NewArchive(os.Getenv("DARCHIVE_PATH"))
	t.Logf("path: %v", archive.Path())
	tags := archive.Tags("Info", []string{"Versicherung", "Allianz"})
	for _, tag := range tags {
		t.Logf("\"%s\"", tag)
	}
}

func TestFiles(t *testing.T) {
	archive := NewArchive(os.Getenv("DARCHIVE_PATH"))
	t.Logf("path: %v", archive.Path())
	files := archive.Files([]string{"Versicherung"})
	for _, file := range files {
		t.Logf("\"%s\"", file.Name)
	}
}

func TestStringSet(t *testing.T) {
	tags := StringSet{}
	tags.Add("Welt")
	tags.Add("Hallo")
	t.Log(tags.Slice("", true))
}
