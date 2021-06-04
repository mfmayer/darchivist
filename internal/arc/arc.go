package arc

import (
	"io/fs"
	"net/http"
	"path/filepath"
	"time"

	"github.com/go-chi/chi"
	"github.com/go-chi/cors"
	"github.com/mfmayer/darchivist/internal/api"
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

// find returns found tags and files based on filterString and selectedTags
func (arc *Archive) find(filterString string, selectedTags []string) (tags []string, files []api.File) {
	tagSet := StringSet{}
	dirTagSet := StringSet{}
	walkArchive(arc.path, func(absPath string, relPath string, de fs.DirEntry, err error) error {
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

// renameTag renames tag in the archive
func (arc *Archive) renameTag(from string, to string) (err error) {
	if from == "" || to == "" {
		return nil
	}
	// find relevant files and dirs to be be renamed
	files := []string{}
	dirs := []string{}
	walkArchive(arc.path, func(absPath string, relPath string, de fs.DirEntry, err error) error {
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
			renameOperation.Actions = append(renameOperation.Actions, renamAction)
		}
	}

	err = arc.undoStack.Do(renameOperation)
	return
}

// InstallAPI installs the api handler functions
func (arc *Archive) InstallAPI(r chi.Router) {
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins: []string{"*"}, // consider to allow specific origin hosts only
	}))
	r.Get("/info", api.GetHandler(func() (rs *api.Response, code int) {
		undoCount, redoCount := arc.undoStack.State()
		rs = &api.Response{
			Title:       "DArchivist",
			Version:     "v0.0.1",
			ArchivePath: arc.Path(),
			CurrentLanguage: api.Language{
				Tag:  arc.currentLanguage.String(),
				Name: display.Self.Name(arc.currentLanguage),
			},
			UndoRedoCount: []int{undoCount, redoCount},
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
		tags, files := arc.find(rq.TagsFilter, rq.SelectedTags)
		rs = &api.Response{
			Tags:  tags,
			Files: files,
		}
		code = http.StatusOK
		return
	}))
	r.Post("/renameTag", api.PostHandler(func(rq *api.Request) (rs *api.Response, code int) {
		err := arc.renameTag(rq.RenameTag.From, rq.RenameTag.To)
		undoCount, redoCount := arc.undoStack.State()
		rs = &api.Response{
			Notification: &api.Notification{
				Message: "Done",
			},
			UndoRedoCount: []int{undoCount, redoCount},
		}
		if err != nil {
			rs.Notification.Message = err.Error()
		}
		code = http.StatusOK
		return
	}))
	r.Get("/undo", api.GetHandler(func() (rs *api.Response, code int) {
		err := arc.undoStack.Undo()
		undoCount, redoCount := arc.undoStack.State()
		rs = &api.Response{
			Notification: &api.Notification{
				Message: "Done",
			},
			UndoRedoCount: []int{undoCount, redoCount},
		}
		if err != nil {
			rs.Notification.Message = err.Error()
		}
		code = http.StatusOK
		return
	}))
	r.Get("/redo", api.GetHandler(func() (rs *api.Response, code int) {
		err := arc.undoStack.Redo()
		undoCount, redoCount := arc.undoStack.State()
		rs = &api.Response{
			Notification: &api.Notification{
				Message: "Done",
			},
			UndoRedoCount: []int{undoCount, redoCount},
		}
		if err != nil {
			rs.Notification.Message = err.Error()
		}
		code = http.StatusOK
		return
	}))
}
