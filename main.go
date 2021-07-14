package main

import (
	"flag"
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/mfmayer/darchivist/internal/arc"
	"github.com/mfmayer/darchivist/internal/log"
	"github.com/mfmayer/darchivist/internal/vfs/vfswebui"
)

var listenUiAddr = flag.String("listen", ":9055", "Listen address and port")
var archivePath = flag.String("path", os.Getenv("DARCHIVE_PATH"), "Path to the documents archive (can also be set by environment varaible DARCHIVE_PATH)")

func exists(path string) bool {
	_, err := os.Stat(path)
	if err == nil {
		return true
	}
	if os.IsNotExist(err) {
		return false
	}
	return false
}

func init() {
}

func main() {
	flag.Parse()

	if !exists(*archivePath) {
		log.Error.Print("Invalid archive path set")
		flag.PrintDefaults()
		os.Exit(-1)
	}

	archive := arc.NewArchive(*archivePath)

	router := chi.NewRouter()

	router.Route("/api/", archive.InstallAPI)
	router.Get("/", http.RedirectHandler("/ui/", http.StatusMovedPermanently).ServeHTTP)
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
		router.Get(path, http.RedirectHandler(path+"/", http.StatusMovedPermanently).ServeHTTP)
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
