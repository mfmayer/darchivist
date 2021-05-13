# DArchivist (Digital Archivist)

DArchivist is meant to be your personal digital archivist, helping you archive and find your documents in your paperless (home) office. His goal is to keep everything as simple and straightforward as possible. No databases, no dependencies on tools, as few frameworks as possible.

TODO: Describe Software, idea and principle behind DArchivist while going paperless.

## Getting started

After cloning the project, it can be just compiled by:

```shell
$ go generate
go: downloading github.com/go-chi/chi v1.5.1
go: downloading github.com/go-chi/cors v1.1.1
go: downloading github.com/shurcooL/vfsgen v0.0.0-20200824052919-0d455de96546
go: downloading github.com/shurcooL/httpfs v0.0.0-20190707220628-8d4bc4ba7749
$ go build
```

As you can see the `go generate` step creates a virtual filesystem that contains all the UI sources that will be served by the application's webserver. After valling `go build` the binary (`go-vue`) should be created.

After starting the application, it will listen on port 9055:

```shell
$ ./darchivist
INFO:  2021/01/10 14:04:04 Web UI listening on: :9055
```
