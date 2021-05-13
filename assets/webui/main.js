import { InitAPI } from './_api.js'
var apiURL = "../api/"
const API = InitAPI(apiURL)

import { Taglist } from './components/taglist.js'
Taglist.setAPI(API)
import { MainMenu } from './components/mainmenu.js'
MainMenu.setAPI(API)
// import { MainTemplate } from './templates/main-template.js'

Quasar.lang.set(Quasar.lang.de)

var app = new Vue({
  el: '#q-app',
  components: {
    'tag-list': Taglist,
    'main-menu': MainMenu,
  },
  data: {
    showDrawer: true,
    languages: ["de"],
    currentLanguage: "",
    title: "",
    version: "",
    archivePath: "",
    tagfilter: "",
  },
  methods: {
    apiCallFailed: function (error) {
      app.$q.notify('Looks like there was an API problem: ' + error)
    },
    getInfo: function () {
      API.get("info").
        then(function (result) {
          app.title = result.title
          app.version = result.version
          app.archivePath = result.archivePath
          // app.tags = result.tags
          // Taglist.tags = result.tags
        }).catch(app.apiCallFailed)
    },
    refreshTags: function () {
      var rq = { tagsFilter: this.tagfilter }
      API.post("tags", rq).then(result => {
        Object.freeze(result.tags)
        this.tags = result.tags
      }).catch(this.apiCallFailed)
    },
  },
  template: String.raw`
  <q-layout view="lHh lpR fFf">
  
    <q-header class="bg-primary text-black">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="showDrawer = !showDrawer"></q-btn>
        <q-toolbar-title>
        </q-toolbar-title>
        <main-menu></main-menu>
      </q-toolbar>
    </q-header>
    <q-drawer show-if-above v-model="showDrawer" side="left">
      <tag-list></tag-list>
    </q-drawer>
  
  
    <q-page-container>
      <div class="q-pa-md row justify-center">
        <div style="width: 100%">
        </div>
      </div>
    </q-page-container>
  
  </q-layout>
`
})

API.get("info").
  then(function (result) {
    app.title = result.title
    app.version = result.version
    app.archivePath = result.archivePath
    app.tags = result.tags
  }).catch(app.apiCallFailed)
