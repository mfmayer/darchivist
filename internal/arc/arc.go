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
	"github.com/mfmayer/darchivist/internal/log"
	"github.com/mfmayer/undostack"
	"golang.org/x/text/language"
	"golang.org/x/text/language/display"
)

func init() {
}

type Archive struct {
	path            string
	currentLanguage language.Tag
	languages       []language.Tag
	languageMatcher language.Matcher
	undoStack       undostack.UndoStack
}

func NewArchive(path string) (arc *Archive) {
	arc = &Archive{
		path:            path,
		currentLanguage: language.English,
		languages: []language.Tag{
			language.English,
			language.German,
		},
	}
	arc.languageMatcher = language.NewMatcher(arc.languages)
	return
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

func (arc *Archive) walkArchive(fn func(absPath string, relPath string, d fs.DirEntry, err error) error) error {
	return filepath.WalkDir(arc.path, func(absPath string, de fs.DirEntry, err error) error {
		// skip files/directories that are starting with "."
		if len(de.Name()) > 0 && de.Name()[0] == '.' {
			if de.IsDir() {
				return fs.SkipDir
			}
			return nil
		}
		relPath := absPath[len(arc.path):]
		return fn(absPath, relPath, de, err)
	})
}

func (arc *Archive) Find(filterString string, selectedTags []string) (tags []string, files []api.File) {
	tagSet := StringSet{}
	dirTagSet := StringSet{}
	arc.walkArchive(func(absPath string, relPath string, de fs.DirEntry, err error) error {
		if err == nil {
			var fileTagSet StringSet
			var dateTime *time.Time
			var fileExtension string
			if de.IsDir() {
				_, _, dirTagSet = entryDetails(relPath, de, true)
			} else {
				dateTime, fileExtension, fileTagSet = entryDetails(relPath, de, false)
				if foundAll(selectedTags, dirTagSet, fileTagSet) {
					tagSet.AddSets(dirTagSet, fileTagSet)
					if fi, err := de.Info(); err == nil {
						file := api.File{
							Name:          fi.Name(),
							FileExtension: fileExtension,
							Size:          int(fi.Size()),
							ModTime:       fi.ModTime(),
						}
						if dateTime != nil {
							file.Date = *dateTime
						}
						files = append(files, file)
					}
				}
			}
		}
		return nil
	})
	tags = tagSet.Slice(filterString, true)
	return
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

func (arc *Archive) RenameTag(from string, to string) error {
	if from == "" || to == "" {
		return nil
	}
	// find relevant files and dirs to be be renamed
	files := []string{}
	dirs := []string{}
	arc.walkArchive(func(absPath string, relPath string, de fs.DirEntry, err error) error {
		if err == nil {
			_, _, tags := entryDetails(relPath, de, false)
			if _, ok := tags[from]; ok {
				if de.Type().IsDir() {
					dirs = append(dirs, absPath)
				} else if de.Type().IsRegular() {
					files = append(files, absPath)
				}
			}
		}
		return nil
	})
	if len(files) <= 0 && len(dirs) <= 0 {
		return nil
	}

	// create rename operation and its actions
	renameOperation := &undostack.Operation{
		Name: "Rename",
	}
	renameEntries := [][]string{
		files, dirs, // first rename files, then directories
	}
	for i, e := range renameEntries {
		isFile := true
		if i > 0 {
			isFile = false
		}
		for _, f := range e {
			dir, base := filepath.Split(f)
			base = renameTagInBaseName(base, from, to, isFile)
			renamAction := &RenameAction{
				OldPath: f,
				NewPath: dir + base,
			}
			log.Trace.Println(*renamAction)
			renameOperation.Actions = append(renameOperation.Actions, renamAction)
		}
	}

	arc.undoStack.Do(renameOperation)

	// log.Trace.Println(files)
	// log.Trace.Println(dirs)

	return nil
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
			CurrentLanguage: api.Language{
				Tag:  arc.currentLanguage.String(),
				Name: display.Self.Name(arc.currentLanguage),
			},
		}
		for _, t := range arc.languages {
			rs.Languages = append(rs.Languages, api.Language{
				Tag:  t.String(),
				Name: display.Self.Name(t),
			})
		}
		code = http.StatusOK
		return
	}))
	r.Post("/setLanguage", api.PostHandler(func(rq *api.Request) (rs *api.Response, code int) {
		arc.currentLanguage, _ = language.MatchStrings(arc.languageMatcher, rq.LanguageTag)
		rs = &api.Response{
			CurrentLanguage: api.Language{
				Tag:  arc.currentLanguage.String(),
				Name: display.Self.Name(arc.currentLanguage),
			},
		}
		code = http.StatusOK
		return
	}))
	r.Post("/find", api.PostHandler(func(rq *api.Request) (rs *api.Response, code int) {
		// if cpuProfile, err := os.Create("find_cpu.prof"); err == nil {
		// 	if err := pprof.StartCPUProfile(cpuProfile); err != nil {
		// 		log.Warning.Print(err)
		// 	}
		// 	defer pprof.StopCPUProfile()
		// } else {
		// 	log.Warning.Print(err)
		// }
		tags, files := arc.Find(rq.TagsFilter, rq.SelectedTags)
		rs = &api.Response{
			Tags:  tags,
			Files: files,
		}
		code = http.StatusOK
		return
	}))
	r.Post("/renameTag", api.PostHandler(func(rq *api.Request) (rs *api.Response, code int) {
		arc.RenameTag(rq.RenameTag.From, rq.RenameTag.To)
		rs = &api.Response{
			Notification: &api.Notification{
				Message: "Done",
			},
		}
		code = http.StatusOK
		return
	}))
}
