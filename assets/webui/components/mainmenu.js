// import { TagslistTemplate } from '../templates/tagslist-template.js'

var API

const MainMenu = {
  setAPI: function (_API) {
    API = _API
  },
  props: {},
  data: function () {
    return {
      languageExpanded: false,
      title: "",
      version: "",
      archivePath: "",
      currentLanguage: "",
      languages: [],
    }
  },
  methods: {
    apiCallFailed: function (error) {
      this.$q.notify('Looks like there was an API problem: ' + error)
    },
    apiSetLanguage: function (languageTag) {
      var rq = {
        languageTag: languageTag,
      }
      API.post("setLanguage", rq).then(result => {
        this.currentLanguage = result.currentLanguage
        this.languageExpanded = false
      }).catch(this.apiCallFailed)
    },
    getInfo: function () {
      API.get("info").then(result => {
        this.title = result.title
        this.version = result.version
        this.archivePath = result.archivePath
        this.currentLanguage = result.currentLanguage
        this.languages = result.languages
      }).catch(this.apiCallFailed)
    },
  },
  mounted: function () {
    this.getInfo()
  },
  template: String.raw`
  <q-btn flat round dense icon="more_vert">
    <q-menu>
      <div class="row no-wrap q-pa-sm">
        <div>
          <q-chip size="md">
            <q-avatar size="md" color="orange" rounded>
              <!-- <img src="https://cdn.quasar.dev/img/boy-avatar.png"> -->
              <q-icon name="inventory"></q-icon>
            </q-avatar>
            {{title}}
          </q-chip>
          <q-badge align="top" color="green">{{version}}</q-badge>
        </div>
      </div>
  
      <q-list dense>
        <q-item>
          <q-item-section side>
            <q-icon name="folder"></q-icon>
          </q-item-section>
          <q-item-section>{{archivePath}}</q-item-section>
        </q-item>
      <q-separator></q-separator>
  
        <q-expansion-item dense switch-toggle-side expand-separator v-model="languageExpanded" icon="language"
          :label="currentLanguage">
          <q-list>
            <q-item v-for="n in languages" :key="n.tag" dense clickable @click='apiSetLanguage(n.tag)'>
              <q-item-section side>
                <!-- <q-icon name="keyboard_arrow_right" /> -->
              </q-item-section>
              <q-item-section>{{n.name}}</q-item-section>
            </q-item>
          </q-list>
        </q-expansion-item>
      </q-list>
    </q-menu>
  </q-btn>
`,
}

export {
  MainMenu
}