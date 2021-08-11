package arc

import (
	"errors"
	"io/fs"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/araddon/dateparse"
	"github.com/mfmayer/darchivist/internal/api"
	"golang.org/x/text/language"
	"golang.org/x/text/message"
	"golang.org/x/text/search"
)

func containsFunc(filter string, languageTag language.Tag) func(s string) bool {
	fn := func(s string) bool {
		m := search.New(languageTag, search.IgnoreCase, search.IgnoreDiacritics)
		start, end := m.IndexString(s, filter)
		if start != -1 && end != -1 {
			return true
		}
		return false
	}
	return fn
}

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

// Tags parses and returns element's tags and timestamp if available
func Tags(element string, isDir bool, preparedSet StringSet) (date time.Time, tagSet StringSet) {
	if preparedSet != nil {
		tagSet = preparedSet
	} else {
		tagSet = StringSet{}
	}
	// Replace path separators with space
	if !isDir {
		element, _ = splitExtension(element)
	}
	e := strings.ReplaceAll(element, string(os.PathSeparator), " ")
	// Split into tags separated by " "
	tags := strings.Split(e, " ")
	for _, tag := range tags {
		if tag == "" {
			continue
		}
		if date.IsZero() {
			if t, err := dateparse.ParseAny(tag); err == nil {
				date = t
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

func entryDetails(path string, de fs.DirEntry, deepTagSet bool) (dateTime time.Time, fileExtension string, tagSet StringSet) {
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
		_, tagSet = Tags(path, de.IsDir(), tagSet)
	}
	dateTime, tagSet = Tags(name, de.IsDir(), tagSet)
	return
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

func errorToLog(errLogEntry *errorLogEntry, printer *message.Printer) (log *api.Log) {
	//var multiErr *multierror.Error
	if errLogEntry != nil {
		log = &api.Log{
			Time:  errLogEntry.time,
			Label: errLogEntry.err.Error(),
		}
		for err := errors.Unwrap(errLogEntry.err); err != nil; err = errors.Unwrap(err) {
			faErr := &FileActionError{}
			trErr := &TranslateError{}
			if errors.As(err, &faErr) {
				log.Files = append(log.Files, faErr.FilePaths...)
			}
			if errors.As(err, &trErr) {
				log.SubLabels = append(log.SubLabels, trErr.Translate(printer))
			} else {
				log.SubLabels = append(log.SubLabels, err.Error())
			}
		}
	}
	return
}

func errorsToLogs(errLogEntries []*errorLogEntry, printer *message.Printer) (logs []*api.Log) {
	for _, entry := range errLogEntries {
		logs = append(logs, errorToLog(entry, printer))
	}
	return
}
