package api

import (
	"encoding/json"
	"io/ioutil"
	"net/http"

	"github.com/go-chi/chi"
	"github.com/go-chi/cors"
	"github.com/mfmayer/darchivist/internal/arc"
	"github.com/mfmayer/darchivist/internal/log"
)

type getHandleFunc func() (rs *response, code int)
type postHandleFunc func(rq *request) (rs *response, code int)

func getHandler(handleFunc getHandleFunc) func(w http.ResponseWriter, r *http.Request) {
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

func postHandler(handleFunc postHandleFunc) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		rqBody, err := ioutil.ReadAll(r.Body)
		defer r.Body.Close()
		if err != nil {
			log.Error.Printf("Error reading body: %v", err)
			http.Error(w, "can't read body", http.StatusBadRequest)
			return
		}
		rq := &request{}
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

type response struct {
	Title           string   `json:"title,omitempty"`
	Version         string   `json:"version,omitempty"`
	ArchivePath     string   `json:"archivePath,omitempty"`
	CurrentLanguage string   `json:"currentLanguage,omitempty"`
	Languages       []string `json:"languages,omitempty"`
	Tags            []string `json:"tags,omitempty"`
}

type request struct {
	TagsFilter string `json:"tagsFilter,omitempty"`
}

// InstallAPI installs the api handler functions
func InstallAPI(r chi.Router) {
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins: []string{"*"}, // consider to allow specific origin hosts only
	}))
	r.Get("/info", getHandler(func() (rs *response, code int) {
		rs = &response{
			Title:       "DArchivist",
			Version:     "v0.0.1",
			ArchivePath: arc.Path(),
			// Tags:        arc.Tags(""),
		}
		code = http.StatusOK
		return
	}))
	r.Post("/tags", postHandler(func(rq *request) (rs *response, code int) {
		rs = &response{
			Tags: arc.Tags(rq.TagsFilter),
		}
		code = http.StatusOK
		return
	}))
}
