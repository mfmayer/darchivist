import { InitAPI } from './_api.js'
var apiURL = "../api/"
const API = InitAPI(apiURL)

import { MainMenu } from './components/mainmenu.js'
MainMenu.setAPI(API)
import { Taglist } from './components/taglist.js'
Taglist.setAPI(API)
import { FileTable } from './components/filetable.js'
FileTable.setAPI(API)
// import { MainTemplate } from './templates/main-template.js'

Quasar.lang.set(Quasar.lang.de)

var app = new Vue({
  el: '#q-app',
  components: {
    'main-menu': MainMenu,
    'tag-list': Taglist,
    'file-table': FileTable,
  },
  data: {
    showTaglist: true,
    languages: ["de"],
    currentLanguage: "",
    tagFilter: "",
    selectedTags: [],
    tags: [],
    files: [],
  },
  methods: {
    apiCallFailed: function (error) {
      app.$q.notify('Looks like there was an API problem: ' + error)
    },
    apiGetTags: function () {
      var rq = {
        tagsFilter: this.tagFilter,
        selectedTags: this.selectedTags
      }
      API.post("tags", rq).then(result => {
        Object.freeze(result.tags)
        this.tags = result.tags
      }).catch(this.apiCallFailed)
    },
    apiGetFiles: function () {
      var rq = {
        selectedTags: this.selectedTags
      }
      API.post("files", rq).then(result => {
        Object.freeze(result.tags)
        this.files = result.files
      }).catch(this.apiCallFailed)
    },
    selectBestMatch: function () {
      // TODO: select tag
    },
    tagDeselected: function (tag) {
      var index = this.selectedTags.indexOf(tag)
      if (index >= 0) {
        this.selectedTags.splice(index, 1)
      }
    },
    tagSelected: function (tag) {
      var index = this.selectedTags.indexOf(tag)
      if (index < 0) {
        this.selectedTags.push(tag)
        this.tagFilter = ""
      }
    }
  },
  watch: {
    tagFilter: {
      immediate: true,
      handler (newVal, oldVal) {
        this.apiGetTags()
      }
    },
    selectedTags: {
      handler (newVal, oldVal) {
        this.apiGetTags()
        this.apiGetFiles()
      }
    }
  },
  template: String.raw`
  <q-layout view="hHh lpR fFf" style="height: 100%">
  
    <q-header class="bg-primary">
      <q-toolbar>
        <q-btn flat round dense icon="menu" class="q-mr-sm" @click="showTaglist = !showTaglist"></q-btn>
        <q-separator vertical inset />
        <q-toolbar-title>
          <q-input dark dense standout v-model="tagFilter" placeholder="Filter Tags"
            @keydown.enter="selectBestMatch(tagFilter)">
          </q-input>
        </q-toolbar-title>
        <main-menu></main-menu>
      </q-toolbar>
      <div class="q-pa-xs q-gutter-x-none">
  
        <q-icon v-if="selectedTags.length > 0" name="cancel" style="font-size: 24px;" class="q-ma-xs cursor-pointer"
          @click.stop="selectedTags=[]"></q-icon>
        <q-icon v-else name="style" style="font-size: 24px;" class="q-ma-xs"></q-icon>
        <!-- <q-btn v-if="selectedTags.length > 0" dense flat icon="cancel" @click.stop="selectedTags=[]"></q-btn> -->
  
        <template v-for="(tag, index) in selectedTags">
          <q-chip dense removable color="secondary" @remove="tagDeselected(tag)">{{tag}}</q-chip>
        </template>
      </div>
    </q-header>
    <q-drawer show-if-above v-model="showTaglist" side="left" behavior="desktop">
      <tag-list :tags="tags" @tagSelected="tagSelected"></tag-list>
    </q-drawer>
  
    <q-page-container class="fit">
      <q-page class="fit">
        <file-table :files="files"></file-table>
      </q-page>
    </q-page-container>
  
  </q-layout>
`
})

app.apiGetFiles()

API.get("info").
  then(function (result) {
    app.title = result.title
    app.version = result.version
    app.archivePath = result.archivePath
    app.tags = result.tags
  }).catch(app.apiCallFailed)
