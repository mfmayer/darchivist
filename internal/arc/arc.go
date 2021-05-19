package arc

import (
	"io/fs"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/araddon/dateparse"
	"github.com/go-chi/chi"
	"github.com/go-chi/cors"
	"github.com/mfmayer/darchivist/internal/api"
)

func init() {
}

type Archive struct {
	path string
}

func NewArchive(path string) *Archive {
	return &Archive{
		path: path,
	}
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
		// if ft == "2019" {
		// 	log.Printf("%s", ft)
		// }
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

func entryDetails(path string, e fs.DirEntry, deepTagSet bool) (dateTime *time.Time, fileExtension *string, tagSet StringSet) {
	tagSet = StringSet{}
	name := e.Name()
	if e.Type().IsRegular() {
		// Extract and strip file extension
		if i := strings.LastIndex(name, "."); i > 0 {
			fext := name[i+1:]
			fileExtension = &fext
			name = name[:i]
		}
	} else if e.Type().IsDir() {
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

func (arc *Archive) Tags(filter string, siblings []string) []string {
	tagSet := StringSet{}
	dirTagSet := StringSet{}
	// prefixLength := len(Path())
	// pathSeparator := string(os.PathSeparator)
	// tsLayout := "2006-01-02"
	filepath.WalkDir(arc.path, func(path string, d fs.DirEntry, err error) error {
		if err == nil {
			var fileTagSet StringSet
			if d.IsDir() {
				_, _, dirTagSet = entryDetails(path[len(arc.path):], d, true)
			} else {
				_, _, fileTagSet = entryDetails(path[len(arc.path):], d, false)
			}
			if foundAll(siblings, dirTagSet, fileTagSet) {
				tagSet.AddSets(dirTagSet, fileTagSet)
			}
			// log.Printf("%v - %v\n", dirTagSet, fileTagSet)
		}
		return err
	})
	tags := tagSet.Slice(filter, true)
	return tags
}

// InstallAPI installs the api handler functions
func (arc *Archive) InstallAPI(r chi.Router) {
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins: []string{"*"}, // consider to allow specific origin hosts only
	}))
	r.Get("/info", api.GetHandler(func() (rs *api.Response, code int) {
		rs = &api.Response{
			Title:       "DArchivist",
			Version:     "v0.0.1",
			ArchivePath: arc.Path(),
			// Tags:        arc.Tags(""),
		}
		code = http.StatusOK
		return
	}))
	r.Post("/tags", api.PostHandler(func(rq *api.Request) (rs *api.Response, code int) {
		rs = &api.Response{
			Tags: arc.Tags(rq.TagsFilter, rq.SelectedTags),
		}
		code = http.StatusOK
		return
	}))
}
