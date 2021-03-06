var API

const TagEdit = {
  init: function (_API) {
    API = _API
  },
  data: function () {
    return {
      confirmDelete: false,
      renamedTag: this.tag
    }
  },
  props: {
    tag: String
  },
  methods: {
    apiCallFailed: function (error) {
      this.$q.notify('Looks like there was an API problem: ' + error)
    },
    show: function () {
      this.renamedTag = this.tag
      this.$refs.popup.show()
    },
    cancel: function () {
      if (this.renamedTag !== this.tag) {
        this.renamedTag = this.tag
      } else {
        this.$refs.popup.hide()
      }
    },
    renameTag: function () {
      if (this.renamedTag === "") {
        this.confirmDelete = true
      } else {
        var rq = {
          renameTag: {
            from: this.tag,
            to: this.renamedTag
          }
        }
        API.post("renameTag", rq).then(result => {
          this.$emit('modified')
        }).catch(this.apiCallFailed)
        this.$refs.popup.hide()
      }
    },
    deleteTag: function () {
      // TODO: API delete tag
      this.$q.notify('TODO: API -> delete tag')
      this.confirmDelete = false
      this.$refs.popup.hide()
    }
  },
  template: String.raw`
<q-popup-proxy cover anchor="top left" no-parent-event ref="popup">
  <q-item>
    <q-item-section>
    <q-input v-model="renamedTag" dense borderless hide-bottom-space autofocus>
      <template v-slot:append>
        <q-icon name="close" @click="cancel()" class="cursor-pointer"></q-icon>
        <q-icon v-if="renamedTag !== tag" name="check" @click="renameTag" class="cursor-pointer"></q-icon>
      </template>
    </q-input>
    </q-item-section>
  </q-item>
  <!-- <div class="column q-banner">
    <q-input dense v-model="renamedTag" autofocus></q-input>
    <div dense class="q-py-md q-gutter-sm">
      <q-btn round color="secondary" icon="done" @click="renameTag"></q-btn>
      <q-btn round color="secondary" icon="close" @click="cancel"></q-btn>
      <q-btn round color="red" icon="delete" class="float-right" @click="confirmDelete=true"></q-btn>
    </div>
  </div> -->
  <q-dialog v-model="confirmDelete" persistent>
    <q-card>
      <q-card-section class="row items-center">
        <q-avatar icon="delete" color="red" text-color="white"></q-avatar>
        <span class="q-ml-sm">Delete tag?</span>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="secondary" v-close-popup></q-btn>
        <q-btn flat label="Delete" color="red" @click="deleteTag" v-close-popup></q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</q-popup-proxy>`
}

export {
  TagEdit
}