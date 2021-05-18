package api

import (
	"encoding/json"
	"io/ioutil"
	"net/http"

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

type Response struct {
	Title           string   `json:"title,omitempty"`
	Version         string   `json:"version,omitempty"`
	ArchivePath     string   `json:"archivePath,omitempty"`
	CurrentLanguage string   `json:"currentLanguage,omitempty"`
	Languages       []string `json:"languages,omitempty"`
	Tags            []string `json:"tags,omitempty"`
}

type Request struct {
	TagsFilter   string   `json:"tagsFilter,omitempty"`
	SelectedTags []string `json:"selectedTags,omitempty"`
}
