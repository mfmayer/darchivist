import { InitAPI } from './_api.js'
var apiURL = "../api/"
const API = InitAPI(apiURL)

// import { Tagslist } from './components/tagslist.js'
// Tagslist.setAPI(API)
// import { MainTemplate } from './templates/main-template.js'

var app = new Vue({
  el: '#q-app',
  components: {
    // 'tags-list': Tagslist,
  },
  data: {
    showDrawer: true,
    title: "",
    version: "",
    archivePath: "",
    tagfilter: "",
    tags: ["test1", "test2"],
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
          app.tags = result.tags

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
          <q-icon name="folder"></q-icon>
          {{archivePath}}
          <q-badge align="top" color="green">{{version}}</q-badge>
        </q-toolbar-title>
        <q-btn flat round dense icon="more_vert" @click="getInfo"></q-btn>
      </q-toolbar>
    </q-header>
  
    <q-drawer show-if-above v-model="showDrawer" side="left" bordered>
      <!-- <tags-list @name-set="setMessage"></tags-list> -->
  
      <div class="absolute-top bg-transparent" style="height: 150px">
        <q-input standout square dense v-model="tagfilter" label="Filter" @keyup.enter="refreshTags" class="full-width">
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
              <q-item-section side>
                <!-- <q-checkbox v-model="item.active"></q-checkbox> -->
              </q-item-section>
            </q-item>
          </template>
        </q-virtual-scroll>
      </q-scroll-area>
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
