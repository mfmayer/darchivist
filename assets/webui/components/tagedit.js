var API

const TagEdit = {
  setAPI: function (_API) {
    API = _API
  },
  props: [],
  data: function () {
    return {
    }
  },
  methods: {
    apiCallFailed: function (error) {
      this.$q.notify('Looks like there was an API problem: ' + error)
    },
  },
  template: String.raw`
  <q-popup-proxy cover anchor="top left">
    <q-item dense class="q-banner">
      <q-item-section>
        <q-input dense v-model="item" autofocus></q-input>
      </q-item-section>
    </q-item>
  </q-popup-proxy>
  `
}

export {
  TagEdit
}