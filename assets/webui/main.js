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
    // title: "",
    // version: "",
    // archivePath: "",
    tagFilter: "",
    filteredTags: [],
    selectedTags: [],
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
        this.filteredTags = result.tags
      }).catch(this.apiCallFailed)
    },
    // getInfo: function () {
    //   API.get("info").
    //     then(function (result) {
    //       app.title = result.title
    //       app.version = result.version
    //       app.archivePath = result.archivePath
    //     }).catch(app.apiCallFailed)
    // },
    filterChanged: function (value) {
      this.tagFilter = value
    },
    // clearFilter: function () {
    //   if (this.$refs.qselect !== void 0) {
    //     this.$refs.qselect.updateInputValue('Bla')
    //   }
    // },
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
          <q-chip dense removable color="secondary" @remove="tagDeselected(tag)">{{tag}}</q-chip>
        </template>
      </div>
    </q-header>
    <q-drawer show-if-above v-model="showTaglist" side="left" behavior="desktop">
      <tag-list :filteredTags="filteredTags" @tagSelected="tagSelected"></tag-list>
    </q-drawer>
  
    <q-page-container class="fit">
      <q-page class="fit">
        <file-table></file-table>
      </q-page>
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
