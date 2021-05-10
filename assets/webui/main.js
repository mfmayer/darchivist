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
    'main-menu': MainMenu
    // 'tags-list': Tagslist,
  },
  data: {
    showDrawer: true,
    languages: ["de"],
    currentLanguage: "",
    title: "",
    version: "",
    archivePath: "",
    tagfilter: "",
    // tags: ["test1", "test2"],
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
  <q-layout view="lHr lpR fFf">
  
    <q-header class="bg-primary text-black">
      <q-toolbar>
        <main-menu></main-menu>
        <q-toolbar-title>
        </q-toolbar-title>
        <q-btn dense flat round icon="menu" @click="showDrawer = !showDrawer"></q-btn>
        <!-- <q-select v-model="currentLanguage" :options="languages" borderless>
                                                                                                                                    <template v-slot:prepend>
                                                                                                                                      <q-icon name="language" />
                                                                                                                                    </template>
                                                                                                                                  </q-select> -->
        <!-- <div class="self-stretch"> -->
        <!-- <q-btn-dropdown flat class="self-stretch">
                                                      <q-list>
                                                        <q-item clickable v-close-popup>
                                                          <q-item-section>
                                                            <q-item-label>Photos</q-item-label>
                                                          </q-item-section>
                                                        </q-item>
                                                      </q-list>
                                                    </q-btn-dropdown> -->
        <!-- <q-btn flat round dense icon="more_vert" @click="getInfo"></q-btn> -->
  
        <!-- </div> -->
  
      </q-toolbar>
    </q-header>
  
    <q-drawer show-if-above v-model="showDrawer" side="right">
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
