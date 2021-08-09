var API

const File = {
  init: function (_API) {
    API = _API
  },
  data: function () {
    return {
      confirmDelete: false
    }
  },
  props: {
    file: Object
  },
  methods: {
    apiCallFailed: function (error) {
      this.$q.notify('Looks like there was an API problem: ' + error)
    },
  },
  template: String.raw`
  <q-item :key="file.name" clickable @click="$emit('selected',file)">
    <!-- <tag-edit :tag="item" :ref="'tagEdit' + index" @modified="tagModified(item)"></tag-edit> -->
    <q-item-section>
      <q-item-label lines="1">
        {{file.name}}
      </q-item-label>
    </q-item-section>
    <q-item-section clickable side>
      <q-btn class="gt-xs" size="12px" flat dense round icon="more_vert" @click.stop="">
        <q-menu>
          <q-list style="min-width: 100px">
            <q-item clickable v-close-popup>
              <q-item-section>{{ $t("ui.assign") }}</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="">
              <q-item-section>{{ $t("ui.rename") }}</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="confirmDelete=true">
              <q-item-section>{{ $t("ui.delete") }}</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </q-item-section>
  </q-item>`
}

export {
  File
}