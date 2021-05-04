package arc

import "testing"

func TestTags(t *testing.T) {
	t.Logf("path: %v", Path())
	tags := Tags("Kind")
	for _, tag := range tags {
		t.Logf("\"%s\"", tag)
	}
}

func TestStringSet(t *testing.T) {
	tags := StringSet{}
	tags.Add("Welt")
	tags.Add("Hallo")
	t.Log(tags.Slice("", true))
}
