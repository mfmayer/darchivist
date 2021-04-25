import { MainTemplate } from './templates/main-template.js'
import { InitAPI } from './_api.js'
const queryString = window.location.search
const urlParams = new URLSearchParams(queryString)
var apiURL = "../api/"
const API = InitAPI(apiURL)

var app = new Vue({
  el: '#q-app',
  data: {
    archivePath: "",
    name: "",
    message: "",
    tags: [
      {
        name: "tag1",
        key: "key1",
        active: false
      }, {
        name: "tag2",
        key: "key2",
        active: true
      }
    ],
    left: false,
  },
  methods: {
    apiCallFailed: function (error) {
      app.$q.notify('Looks like there was an API problem: ' + error)
    },
    checkVersion: function () {
      API.get("version").then(result => {
        app.$q.notify('Running on ' + result.version)
      }).catch(this.apiCallFailed)
    },
    setName: function () {
      API.post("setName", { name: app.name }).then(result => {
        app.message = result.message
      }).catch(this.apiCallFailed)
    }
  },
  template: MainTemplate
})

API.get("archivePath").
  then(function (result) {
    app.archivePath = result.archivePath
  }).catch(app.apiCallFailed)
