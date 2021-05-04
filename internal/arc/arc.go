package arc

import (
	"flag"
	"io/fs"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/araddon/dateparse"
)

var _archivePath *string //= flag.String("path", "~/Documents", "Path to the documents archive")

func init() {
	userHomeDir, _ := os.UserHomeDir()
	userHomeDir += "/Documents"
	_archivePath = flag.String("path", userHomeDir, "Path to the documents archive")
}

func Path() string {
	return *_archivePath
}

func EntryDetails(e fs.DirEntry, preparedTagSet StringSet) (dateTime *time.Time, fileExtension *string, tagSet StringSet) {
	if preparedTagSet != nil {
		tagSet = preparedTagSet
	} else {
		tagSet = StringSet{}
	}
	if e.Type().IsRegular() {
		name := e.Name()
		// Strip file extension
		if i := strings.LastIndex(name, "."); i > 0 {
			name = name[:i]
		}
		// Split into tags separated by " "
		fileTags := strings.Split(name, " ")
		for _, ft := range fileTags {
			// if ft == "2019" {
			// 	log.Printf("%s", ft)
			// }
			if dateTime == nil {
				if t, err := dateparse.ParseAny(ft); err == nil {
					dateTime = &t
					continue
				}
			}
			tagSet[ft] = struct{}{}
		}
	} else if e.Type().IsDir() {
		tagSet[e.Name()] = struct{}{}
	}
	return
}

func Tags(filter string) []string {
	tagSet := StringSet{}
	// prefixLength := len(Path())
	// pathSeparator := string(os.PathSeparator)
	// tsLayout := "2006-01-02"
	filepath.WalkDir(Path(), func(path string, d fs.DirEntry, err error) error {
		if err == nil {
			EntryDetails(d, tagSet)
		}
		return err
	})
	tags := tagSet.Slice(filter, true)
	return tags
}
