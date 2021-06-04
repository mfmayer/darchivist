package arc

import (
	"io/fs"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/araddon/dateparse"
)

func walkArchive(archivePath string, fn func(absPath string, relPath string, d fs.DirEntry, err error) error) error {
	return filepath.WalkDir(archivePath, func(absPath string, de fs.DirEntry, err error) error {
		// skip files/directories that are starting with "."
		if len(de.Name()) > 0 && de.Name()[0] == '.' {
			if de.IsDir() {
				return fs.SkipDir
			}
			return nil
		}
		relPath := absPath[len(archivePath):]
		return fn(absPath, relPath, de, err)
	})
}

func getTags(name string, preparedSet StringSet) (dateTime *time.Time, tagSet StringSet) {
	if preparedSet != nil {
		tagSet = preparedSet
	} else {
		tagSet = StringSet{}
	}
	// Split into tags separated by " "
	tags := strings.Split(name, " ")
	for _, tag := range tags {
		if tag == "" {
			continue
		}
		if dateTime == nil {
			if t, err := dateparse.ParseAny(tag); err == nil {
				dateTime = &t
				continue
			}
		}
		tagSet[tag] = struct{}{}
	}
	return
}

func splitExtension(base string) (baseWithoutExtension string, extension string) {
	if i := strings.LastIndex(base, "."); i > 0 {
		extension = base[i+1:]
		baseWithoutExtension = base[:i]
	}
	return
}

func entryDetails(path string, de fs.DirEntry, deepTagSet bool) (dateTime *time.Time, fileExtension string, tagSet StringSet) {
	tagSet = StringSet{}
	name := de.Name()
	if de.Type().IsRegular() {
		// Extract and strip file extension
		name, fileExtension = splitExtension(name)
	} else if de.IsDir() {
	} else {
		// only extract tags from files and directories
		return
	}
	if deepTagSet {
		p := strings.ReplaceAll(path, string(os.PathSeparator), " ")
		_, tagSet = getTags(p, tagSet)
	}
	dateTime, tagSet = getTags(name, tagSet)
	return
}

func (arc *Archive) Path() string {
	return arc.path
}

func foundAll(values []string, sets ...StringSet) bool {
NEXTVALUE:
	for _, value := range values {
		for _, set := range sets {
			if set != nil {
				if _, found := set[value]; found {
					continue NEXTVALUE
				}
			}
		}
		// no set included the value
		return false
	}
	// all values were included in any of the given sets
	return true
}

func renameTagInBaseName(baseName, from, to string, isFile bool) (renamed string) {
	ext := ""
	if isFile {
		baseName, ext = splitExtension(baseName)
	}
	tags := strings.Split(baseName, " ")
	newTags := make([]string, len(tags))
	i := 0
	for _, tag := range tags {
		if tag == "" {
			continue
		}
		if tag == from {
			newTags[i] = to
		} else {
			newTags[i] = tag
		}
		i++
	}
	renamed = strings.Join(newTags, " ")
	if isFile {
		renamed = renamed + "." + ext
	}
	return
}
