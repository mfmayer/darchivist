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
    showTaglist: true,
    languages: ["de"],
    currentLanguage: "",
    title: "",
    version: "",
    archivePath: "",
    tagFilter: "",
    filteredTags: [],
    selectedTags: [],
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
        }).catch(app.apiCallFailed)
    },
    filterChanged: function (value) {
      this.tagFilter = value
    },
    clearFilter: function () {
      if (this.$refs.qselect !== void 0) {
        this.$refs.qselect.updateInputValue('Bla')
      }
    },
    unselectTag: function (tag) {
      var index = this.selectedTags.indexOf(tag)
      if (index >= 0) {
        this.selectedTags.splice(index, 1)
      }
    },
    selectTag: function (tag) {
      var index = this.selectedTags.indexOf(tag)
      if (index < 0) {
        this.selectedTags.push(tag)
      }
    }
  },
  watch: {
    tagFilter: {
      immediate: true,
      handler (newVal, oldVal) {
        var rq = { tagsFilter: newVal }
        API.post("tags", rq).then(result => {
          Object.freeze(result.tags)
          this.filteredTags = result.tags
        }).catch(this.apiCallFailed)
      }
    }
  },
  template: String.raw`
  <q-layout view="hHh lpR fFf">
  
    <q-header class="bg-primary">
      <q-toolbar>
        <q-btn flat round dense icon="menu" class="q-mr-sm" @click="showTaglist = !showTaglist"></q-btn>
        <q-separator vertical inset />
        <q-toolbar-title>
          <q-input dark dense standout v-model="tagFilter" placeholder="Filter Tags"></q-input>
        </q-toolbar-title>
        <main-menu></main-menu>
      </q-toolbar>
      <div class="q-pa-xs q-gutter-x-none">
  
        <q-icon v-if="selectedTags.length > 0" name="cancel" style="font-size: 24px;" class="q-ma-xs cursor-pointer"
          @click.stop="selectedTags=[]"></q-icon>
        <q-icon v-else name="style" style="font-size: 24px;" class="q-ma-xs"></q-icon>
        <!-- <q-btn v-if="selectedTags.length > 0" dense flat icon="cancel" @click.stop="selectedTags=[]"></q-btn> -->
  
        <template v-for="(tag, index) in selectedTags">
          <q-chip dense removable color="secondary" @remove="unselectTag(tag)">{{tag}}</q-chip>
        </template>
      </div>
    </q-header>
    <q-drawer show-if-above v-model="showTaglist" side="left" behavior="desktop">
      <tag-list :filteredTags="filteredTags" @tagSelected="selectTag"></tag-list>
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
