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
  <q-layout view="hHh lpR fFf">
  
    <q-header bordered class="bg-primary text-white">
      <q-toolbar>
  
        <q-btn dense flat round icon="menu" @click="showDrawer = !showDrawer"></q-btn>
        <q-toolbar-title>
  
        </q-toolbar-title>
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
        <main-menu></main-menu>
        <!-- </div> -->
  
      </q-toolbar>
    </q-header>
  
    <q-drawer show-if-above v-model="showDrawer" side="left" bordered>
      <tag-list></tag-list>
      <!-- <div class="absolute-top bg-transparent" style="height: 150px">
                                      <q-input standout square dense v-model="tagfilter" label="Filter" @input="refreshTags" class="full-width">
                                        <template v-slot:append>
                                          <q-btn round dense flat icon="filter_alt" @click="refreshTags" />
                                        </template>
                                      </q-input>
                                    </div>
                                
                                    <q-scroll-area id="scroll-area-with-virtual-scroll-1"
                                      style="height: calc(100% - 40px); margin-top: 40px; border-right: 1px solid #ddd">
                                      <q-virtual-scroll :items="tags" scroll-target="#scroll-area-with-virtual-scroll-1 > .scroll"
                                        :virtual-scroll-item-size="48">
                                        <template v-slot="{item, index}">
                                          <q-item :key="item" v-ripple>
                                            <q-item-section>
                                              <q-item-label>
                                                {{item}}
                                              </q-item-label>
                                            </q-item-section>
                                          </q-item>
                                        </template>
                                      </q-virtual-scroll>
                                    </q-scroll-area> -->
  
    </q-drawer>
  
  
    <q-page-container>
      <div class="q-pa-md row justify-center">
        <div style="width: 100%">
          <!-- <q-chat-message v-if="message">{{message}}</q-chat-message> -->
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
