var API

const Tag = {
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
    tag: Object
  },
  methods: {
    apiCallFailed: function (error) {
      this.$q.notify('Looks like there was an API problem: ' + error)
    },
    showEdit: function () {
      this.renamedTag = this.tag
      this.$refs.popup.show()
    },
    cancel: function () {
      if (this.renamedTag !== this.tag) {
        this.renamedTag = this.tag
      } else {
        this.$refs.renamePopup.hide()
      }
    },
    showRenamePopup: function () {
      // let ref = 'tagEdit' + index
      // console.log(ref)
      // console.log(this.$refs[ref])
      this.renamedTag = this.tag
      let el = this.$refs.renamePopup
      el.show()
    },
    renameTag: function () {
      if (this.renamedTag === "") {
        this.confirmDelete = true
      } else if (this.renamedTag !== this.tag) {
        var rq = {
          renameTag: {
            from: this.tag,
            to: this.renamedTag
          }
        }
        API.post("renameTag", rq).then(result => {
          this.$emit('modified')
        }).catch(this.apiCallFailed)
      }
      this.$refs.renamePopup.hide()
    },
    deleteTag: function () {
      // TODO: API delete tag
      this.$q.notify('TODO: API -> delete tag')
      this.confirmDelete = false
      this.$refs.popup.hide()
    }
  },
  template: String.raw`
  <q-item :key="tag.name" clickable @click="$emit('selected',tag.name)">
    <!-- <tag-edit :tag="item" :ref="'tagEdit' + index" @modified="tagModified(item)"></tag-edit> -->
    <q-item-section>
      <q-item-label lines="1">
        {{tag.name}}
      </q-item-label>
    </q-item-section>
    <q-item-section clickable side>
      <q-btn class="gt-xs" size="12px" flat dense round icon="more_vert" @click.stop="">
        <q-menu>
          <q-list style="min-width: 100px">
            <q-item clickable v-close-popup>
              <q-item-section>{{ $t("ui.assign") }}</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="showRenamePopup">
              <q-item-section>{{ $t("ui.rename") }}</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="confirmDelete=true">
              <q-item-section>{{ $t("ui.delete") }}</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </q-item-section>
    <q-popup-proxy cover anchor="top left" no-parent-event ref="renamePopup">
      <q-item>
        <q-item-section>
          <q-input v-model="renamedTag" dense borderless hide-bottom-space autofocus>
            <template v-slot:append>
              <q-icon v-if="renamedTag !== tag" name="check" @click="renameTag" class="cursor-pointer"></q-icon>
              <q-icon name="close" @click="cancel()" class="cursor-pointer"></q-icon>
            </template>
          </q-input>
        </q-item-section>
      </q-item>
    </q-popup-proxy>
    <q-dialog v-model="confirmDelete" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="delete" color="red" text-color="white"></q-avatar>
          <div class="q-ml-sm text-h6">Delete tag?</div>
          <!-- <span class="q-ml-sm">Delete tag?</span> -->
        </q-card-section>
        <q-card-section class="q-pt-none">
          {{tag}}
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="secondary" v-close-popup></q-btn>
          <q-btn flat label="Delete" color="red" @click="deleteTag" v-close-popup></q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-item>`
}

export {
  Tag
}