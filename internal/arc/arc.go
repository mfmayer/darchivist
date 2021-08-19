package arc

import (
	"fmt"
	"io/fs"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/go-chi/chi"
	"github.com/go-chi/cors"
	"github.com/mfmayer/darchivist/internal/api"
	"github.com/mfmayer/darchivist/internal/log"
	"github.com/mfmayer/undostack"
	"golang.org/x/text/language"
	"golang.org/x/text/language/display"
	"golang.org/x/text/message"
)

type errorLogEntry struct {
	time time.Time
	err  error
}

type Archive struct {
	path            string // absolute archive path
	printer         *message.Printer
	currentLanguage language.Tag
	languages       []language.Tag
	languageMatcher language.Matcher
	undoStack       undostack.UndoStack
	errorLogs       []*errorLogEntry
}

// NewArchive creates Archive object by giving absolute path to where the archive files are located
func NewArchive(path string) (arc *Archive) {
	arc = &Archive{
		path:            path,
		currentLanguage: language.English,
		languages: []language.Tag{
			language.English,
			language.German,
		},
	}
	arc.printer = message.NewPrinter(arc.currentLanguage)
	arc.languageMatcher = language.NewMatcher(arc.languages)
	return
}

func (arc *Archive) Path() string {
	return arc.path
}

// find returns found tags and files based on filterString and selectedTags
func (arc *Archive) find(filterString string, selectedTags []string) (tags []*api.Tag, files []api.FileInfo) {
	var contains func(s string) bool
	if filterString != "" {
		contains = containsFunc(filterString, arc.currentLanguage)
	}
	tagSet := TagSet{}
	tagSet.AddSelectedTags(selectedTags...)
	var dirTags StringSet
	walkArchive(arc.path, func(absPath string, relPath string, de fs.DirEntry, err error) error {
		if err == nil {
			// var dateTime *time.Time
			// var fileExtension string
			if de.IsDir() {
				_, _, dirTags = entryDetails(relPath, de, true)
				tagSet.AddTags(dirTags.Slice()...)
			} else {
				_, _, fileTags := entryDetails(relPath, de, false)
				if foundAll(selectedTags, dirTags, fileTags) {
					tagSet.AddFileTags(fileTags.Slice()...)
					tagSet.AddFileTags(dirTags.Slice()...)
					if contains == nil || contains(relPath) {
						// files = append(files, relPath)
						if fileInfo, err := arc.FileInfo(relPath); err == nil {
							files = append(files, fileInfo)
						}
					}
				}
			}
		}
		return nil
	})
	for _, selected := range selectedTags {
		if tag, ok := tagSet[selected]; ok {
			tag.Selected = true
		}
	}
	tags = tagSet.Slice(WithContainsFilter(filterString, arc.currentLanguage), WithStringDistanceSort(filterString))
	return
}

func (arc *Archive) osFileInfo(relPath string) (info os.FileInfo, err error) {
	if relPath == "" {
		err = fmt.Errorf("invalid path")
		return
	}
	absPath := filepath.Join(arc.Path(), relPath)
	relPath, err = filepath.Rel(arc.Path(), absPath)
	if err != nil {
		return
	}
	if strings.HasPrefix(relPath, "../") {
		err = fmt.Errorf("file not within archive directory")
		return
	}
	info, err = os.Lstat(absPath)
	return
}

func (arc *Archive) FileInfo(relPath string) (fileInfo api.FileInfo, err error) {
	fi, err := arc.osFileInfo(relPath)
	if err == nil && fi != nil {
		name, fileExtension := splitExtension(fi.Name())
		date, tagSet := Tags(relPath, fi.IsDir())
		fileInfo = api.FileInfo{
			Name:          name,
			Path:          relPath,
			FileExtension: fileExtension,
			Tags:          tagSet.Slice(),
			Size:          int(fi.Size()),
			Date:          date,
			ModTime:       fi.ModTime(),
		}
	}
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
		DoErrorFormat: func(e []error) string {
			return arc.printer.Sprintf("Renaming %s to %s failed", from, to)
		},
		UndoErrorFormat: func(e []error) string {
			return arc.printer.Sprintf("Renaming %s to %s failed", to, from)
		},
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
			CurrentLanguage: &api.Language{
				Tag:  arc.currentLanguage.String(),
				Name: display.Self.Name(arc.currentLanguage),
			},
			UndoRedoCount: []int{undoCount, redoCount},
			Logs:          errorsToLogs(arc.errorLogs, arc.printer),
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
		arc.printer = message.NewPrinter(arc.currentLanguage)
		rs = &api.Response{
			CurrentLanguage: &api.Language{
				Tag:  arc.currentLanguage.String(),
				Name: display.Self.Name(arc.currentLanguage),
			},
			Logs: errorsToLogs(arc.errorLogs, arc.printer),
		}
		code = http.StatusOK
		return
	}))
	r.Post("/fileInfo", api.PostHandler(func(rq *api.Request) (rs *api.Response, code int) {
		log.Trace.Printf("fileInfos: %v", rq)
		rs = &api.Response{}
		for _, relPath := range rq.FileInfos {
			fileInfo, err := arc.FileInfo(relPath)
			if err == nil {
				rs.Files = append(rs.Files, fileInfo)
			}
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
			//arc.logs = append(arc.logs, errToLog(err))
			errLogEntry := &errorLogEntry{time.Now(), err}
			arc.errorLogs = append(arc.errorLogs, errLogEntry)
			rs.Logs = append(rs.Logs, errorToLog(errLogEntry, arc.printer))
			rs.Notification.Message = err.Error()
			rs.Notification.Color = "red"
			rs.Notification.MultiLine = true
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
			errLogEntry := &errorLogEntry{time.Now(), err}
			arc.errorLogs = append(arc.errorLogs, errLogEntry)
			rs.Logs = append(rs.Logs, errorToLog(errLogEntry, arc.printer))
			rs.Notification.Message = err.Error()
			rs.Notification.Color = "red"
			rs.Notification.MultiLine = true
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
			errLogEntry := &errorLogEntry{time.Now(), err}
			arc.errorLogs = append(arc.errorLogs, errLogEntry)
			rs.Logs = append(rs.Logs, errorToLog(errLogEntry, arc.printer))
			rs.Notification.Message = err.Error()
			rs.Notification.Color = "red"
			rs.Notification.MultiLine = true
		}
		code = http.StatusOK
		return
	}))
}
