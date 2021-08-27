import VueI18n from './locales/vue-i18n.esm.browser.min.js'
import { Translations } from './locales/translations.js'
const i18n = new VueI18n({
  locale: 'ja', // set locale
  messages: Translations, // set locale messages
})

import { InitAPI } from './_api.js'
var apiURL = "../api/"
var API

import { MainMenu } from './components/mainmenu.js'
import { Taglist } from './components/taglist.js'
import { FileList } from './components/filelist.js'
import { LogList } from './components/loglist.js'

// import { MainTemplate } from './templates/main-template.js'

Quasar.lang.set(Quasar.lang.de)

let apiFindAbort = null

Vue.use(VueI18n)

var app = new Vue({
  i18n,
  created: function () {
    API = InitAPI(apiURL, this)
    MainMenu.init(API)
    Taglist.init(API)
    FileList.init(API)
    LogList.init(API)
  },
  el: '#q-app',
  components: {
    'main-menu': MainMenu,
    'tag-list': Taglist,
    'file-list': FileList,
    'log-list': LogList,
  },
  data: {
    splitterModel: {
      current: 100,
      last: 50
    },
    showTaglist: true,
    tagFilter: "",
    selectedTags: [],
    tags: [],
    files: [],
  },
  methods: {
    apiFind: function () {
      if (apiFindAbort != null) {
        apiFindAbort.abort()
      }
      apiFindAbort = new AbortController()
      var rq = {
        tagsFilter: this.tagFilter,
        selectedTags: this.selectedTags
      }
      API.post("find", rq, apiFindAbort)/*.then(response => {
        // Object.freeze(response.tags)
        // this.tags = response.tags
        // this.files = response.files
      }).catch(this.apiCallFailed)*/
    },
    apiUndo: function () {
      API.get("undo")/*.then(response => { }).catch(this.apiCallFailed)*/
      this.apiFind()
    },
    apiRedo: function () {
      API.get("redo")/*.then(response => { }).catch(this.apiCallFailed)*/
      this.apiFind()
    },
    refresh: function () {
      this.apiFind()
    },
    selectBestMatch: function () {
      for (let i = 0; i < this.tags.length; ++i) {
        if (!this.tags[i].selected) {
          this.tagSelected(this.tags[i].name)
          break
        }
      }
    },
    tagDeselected: function (tag) {
      var index = this.selectedTags.length - 1
      if (tag != null) {
        var index = this.selectedTags.indexOf(tag)
      }
      if (index >= 0 && index < this.selectedTags.length) {
        this.selectedTags.splice(index, 1)
      }
    },
    tagSelected: function (tag) {
      var index = this.selectedTags.indexOf(tag)
      if (index < 0) {
        this.selectedTags.push(tag)
        this.tagFilter = ""
      }
    },
    languageChanged: function (language) {
      i18n.locale = language
    },
    showHideLogs: function () {
      if (this.splitterModel.current == 100) {
        this.splitterModel.current = this.splitterModel.last
      } else {
        this.splitterModel.last = this.splitterModel.current
        this.splitterModel.current = 100
      }
    }
  },
  watch: {
    tagFilter: {
      handler (newVal, oldVal) {
        this.refresh()
      }
    },
    selectedTags: {
      handler (newVal, oldVal) {
        this.refresh()
      }
    }
  },
  template: String.raw`
  <q-layout view="hHh lpR fFf" style="height: 100%">
  
    <q-header class="bg-primary">
      <q-toolbar>
        <q-btn flat round dense icon="menu" class="q-mr-sm" @click="showTaglist = !showTaglist"></q-btn>
        <q-toolbar-title>
          <q-input dark dense standout v-model="tagFilter" :placeholder="this.$t('ui.filterTags')"
            @keydown.enter="selectBestMatch(tagFilter)">
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </q-toolbar-title>
        <main-menu ref="mainMenu" @update:language="languageChanged" @undo="apiUndo" @redo="apiRedo"></main-menu>
      </q-toolbar>
      <!-- <div class="q-pa-xs q-gutter-x-none">
        <q-icon v-if="selectedTags.length > 0" name="cancel" style="font-size: 24px;" class="q-ma-xs cursor-pointer"
          @click.stop="selectedTags=[]"></q-icon>
        <q-icon v-else name="style" style="font-size: 24px;" class="q-ma-xs"></q-icon>
        <template v-for="(tag, index) in selectedTags">
          <q-chip dense removable color="secondary" @remove="tagDeselected(tag)">{{tag}}</q-chip>
        </template>
      </div> -->
    </q-header>
    <q-drawer show-if-above v-model="showTaglist" side="left" behavior="desktop">
      <tag-list :tags="tags" :selectedTags="selectedTags" @tagSelected="tagSelected" @tagDeselected="tagDeselected" @modified="refresh"></tag-list>
    </q-drawer>
  
    <q-page-container class="fit no-scroll">
      <q-page class="fit">
        <q-splitter v-model="splitterModel.current" :limits="[0,100]" horizontal class="fit">
  
          <template v-slot:before>
            <file-list :files="files"></file-list>
          </template>
  
          <template v-slot:separator>
            <!-- <q-avatar color="primary" text-color="white" size="40px" icon="drag_handle" /> -->
            <q-btn round color="primary" icon="unfold_more" @click="showHideLogs" draggable="false" />
          </template>
  
          <template v-slot:after>
            <log-list ref="logList">
            </log-list>
          </template>
  
        </q-splitter>
      </q-page>
    </q-page-container>
  
  </q-layout>
`
})

app.apiFind()

// See mainmenu mounted()
// API.get("info").
//   then(function (result) {
//     app.settings.title = result.title
//     app.settings.version = result.version
//     app.settings.archivePath = result.archivePath
//     app.settings.tags = result.tags
//     app.settings.currentLanguage = result.currentLanguage
//     app.settings.languages = result.languages
//   }).catch(app.apiCallFailed)
