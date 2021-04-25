package main

import (
	"flag"
	"fmt"
	"net/http"
	"strings"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/mfmayer/darchivist/internal/api"
	"github.com/mfmayer/darchivist/internal/log"
	"github.com/mfmayer/darchivist/internal/vfs/vfswebui"
)

//go:generate go run internal/vfs/generate_vfswebui.go

var listenUiAddr = flag.String("listen", ":9055", "Listen address and port")

func init() {
}

func main() {
	flag.Parse()
	router := chi.NewRouter()

	router.Route("/api/", api.InstallAPI)
	router.Get("/", http.RedirectHandler("/ui/", 301).ServeHTTP)
	if err := installFileServer(router, "/ui", vfswebui.FileSystem); err != nil {
		panic(err)
	}

	log.Info.Printf("Web UI listening on: %v", *listenUiAddr)
	if err := http.ListenAndServe(*listenUiAddr, router); err != nil {
		panic(err)
	}
}

func installFileServer(router chi.Router, path string, root http.FileSystem) error {
	if strings.ContainsAny(path, "{}*") {
		return fmt.Errorf("FileServer does not permit URL parameters")
	}
	if path != "/" && path[len(path)-1] != '/' {
		router.Get(path, http.RedirectHandler(path+"/", 301).ServeHTTP)
		path += "/"
	}
	fs := http.StripPrefix(path, http.FileServer(root))
	router.Route(path, func(r chi.Router) {
		r.Use(middleware.Compress(5, "gzip"))
		r.Get("/*", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			fs.ServeHTTP(w, r)
		}))
	})
	return nil
}
