// import { TagslistTemplate } from '../templates/tagslist-template.js'
var API

import { TagEdit } from './tagedit.js'

const Taglist = {
  init: function (_API) {
    API = _API
    TagEdit.init(API)
  },
  components: {
    'tag-edit': TagEdit,
  },
  props: {
    tags: Array
  },
  data: function () { return {} },
  methods: {
    tagSelected: function (tag) {
      this.$emit('tagSelected', tag)
    },
    tagRename: function(index) {
      let ref = 'tagEdit'+index
      let el = this.$refs[ref]
      el.show()
      console.log(ref)
      console.log(this.$refs[ref])
    },
    tagModified: function (tag) {
      this.$emit('modified')
    }
  },
  watch: {},
  mounted: function () {
  },
  template: String.raw`
  
  <q-scroll-area id="scroll-area-with-virtual-scroll-1"
    style="height: calc(100% - 0px); margin-top: 0px; border-right: 1px solid #ddd">
    <q-virtual-scroll :items="tags" scroll-target="#scroll-area-with-virtual-scroll-1 > .scroll"
      :virtual-scroll-item-size="48">
      <template v-slot="{item, index}">
        <q-item :key="item" clickable @click="tagSelected(item)">
          <tag-edit :tag="item" :ref="'tagEdit' + index" @modified="tagModified(item)"></tag-edit>
          <!-- <q-popup-proxy :ref="'popupProxy' + index">
            <q-banner>
              <template v-slot:avatar>
                <q-icon name="signal_wifi_off" color="primary" />
              </template>
              You have lost connection to the internet. This app is offline.
            </q-banner>
          </q-popup-proxy> -->
          <q-item-section>
            <q-item-label lines="1">
              {{item}}
            </q-item-label>
          </q-item-section>
          <q-item-section clickable side>
            <!-- <q-btn flat round dense icon="more_vert" @click.stop="tagSelected(item)">
                  </q-btn> -->
            <q-btn flat round dense icon="more_vert" @click.stop="">
              <q-menu>
                <q-list style="min-width: 100px">
                  <q-item clickable v-close-popup>
                    <q-item-section>{{ $t("ui.assign") }}</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="tagRename(index)">
                    <!-- <tag-edit :tag="item" :target="$refs.'tag-'+index" @modified="tagModified(item)"></tag-edit> -->
                    <q-item-section>{{ $t("ui.rename") }}</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup>
                    <q-item-section>{{ $t("ui.delete") }}</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </q-item-section>
        </q-item>
      </template>
    </q-virtual-scroll>
  </q-scroll-area>
`,
}

export {
  Taglist
}