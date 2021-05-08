// import { TagslistTemplate } from '../templates/tagslist-template.js'

var API

const MainMenu = {
  setAPI: function (_API) {
    API = _API
  },
  props: [],
  data: function () {
    return {
      title: "",
      version: "",
      archivePath: ""
    }
  },
  methods: {
    apiCallFailed: function (error) {
      this.$q.notify('Looks like there was an API problem: ' + error)
    },
    getInfo: function () {
      API.get("info").then(result => {
        this.title = result.title
        this.version = result.version
        this.archivePath = result.archivePath
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
      <div class="row items-center no-wrap q-ml-md q-mr-md q-mb-md">
        <q-icon name="folder_open"></q-icon>
        {{archivePath}}
      </div>
      <q-separator />
    </q-menu>
  </q-btn>
`,
}

export {
  MainMenu
}