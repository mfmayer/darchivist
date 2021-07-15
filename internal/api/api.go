package api

import (
	"encoding/json"
	"io/ioutil"
	"net/http"
	"time"

	"github.com/mfmayer/darchivist/internal/log"
)

type getHandleFunc func() (rs *Response, code int)
type postHandleFunc func(rq *Request) (rs *Response, code int)

func GetHandler(handleFunc getHandleFunc) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		rsObject, code := handleFunc()
		if code != 200 {
			statusText := http.StatusText(code)
			if statusText == "" {
				statusText = "Unknown API error"
			}
			http.Error(w, statusText, code)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(code)
		json.NewEncoder(w).Encode(rsObject)
	}
}

func PostHandler(handleFunc postHandleFunc) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		rqBody, err := ioutil.ReadAll(r.Body)
		defer r.Body.Close()
		if err != nil {
			log.Error.Printf("Error reading body: %v", err)
			http.Error(w, "can't read body", http.StatusBadRequest)
			return
		}
		rq := &Request{}
		if err := json.Unmarshal(rqBody, rq); err != nil {
			log.Error.Printf("Error unmarshalling body: %v", err)
			http.Error(w, "can't unmarshal body", http.StatusBadRequest)
			return
		}
		// rs, code := handleFunc(rq)
		rs, code := handleFunc(rq)
		if code != 200 {
			statusText := http.StatusText(code)
			if statusText == "" {
				statusText = "Unknown API error"
			}
			http.Error(w, statusText, code)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(code)
		json.NewEncoder(w).Encode(rs)
	}
}

type File struct {
	Name          string    `json:"name,omitempty"`
	FileExtension string    `json:"fileExtension,omitempty"`
	Size          int       `json:"size,omitempty"`
	Date          time.Time `json:"date,omitempty"`
	ModTime       time.Time `json:"modTime,omitempty"`
}

type RenameTagRequest struct {
	From string `json:"from"`
	To   string `json:"to"`
}

type Notification struct {
	Message   string `json:"message"`
	Color     string `json:"color"`
	MultiLine bool   `json:"multiLine"`
}

type Log struct {
	Time      time.Time `json:"time"`
	Label     string    `json:"label"`
	Files     []string  `json:"files"`
	SubLabels []string  `json:"subLabels"`
}

type Language struct {
	Name string `json:"name"`
	Tag  string `json:"tag"`
}

type Response struct {
	Notification    *Notification `json:"notification,omitempty"`
	Logs            []*Log        `json:"logs,omitempty"`
	Title           string        `json:"title,omitempty"`
	Version         string        `json:"version,omitempty"`
	ArchivePath     string        `json:"archivePath,omitempty"`
	CurrentLanguage *Language     `json:"currentLanguage,omitempty"`
	Languages       []Language    `json:"languages,omitempty"`
	UndoRedoCount   []int         `json:"undoRedoCount,omitempty"`
	Tags            []string      `json:"tags,omitempty"`
	Files           []File        `json:"files,omitempty"`
}

type Request struct {
	TagsFilter   string            `json:"tagsFilter,omitempty"`
	SelectedTags []string          `json:"selectedTags,omitempty"`
	RenameTag    *RenameTagRequest `json:"renameTag,omitempty"`
	LanguageTag  string            `json:"languageTag,omitempty"`
}
