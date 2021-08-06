// import { TagslistTemplate } from '../templates/tagslist-template.js'
var API

import { Tag } from './tag.js'

const Taglist = {
  init: function (_API) {
    API = _API
    Tag.init(API)
  },
  components: {
    'tag': Tag,
  },
  props: {
    tags: Array
  },
  data: function () { return {} },
  methods: {
    tagSelected: function (tag) {
      this.$emit('tagSelected', tag)
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
        <tag :tag="item" @modified="tagModified(item)" @selected="tagSelected"></tag>
        <!-- <q-item :key="item" clickable @click="tagSelected(item)">
          <tag-edit :tag="item" :ref="'tagEdit' + index" @modified="tagModified(item)"></tag-edit>
          <q-item-section>
            <q-item-label lines="1">
              {{item}}
            </q-item-label>
          </q-item-section>
          <q-item-section clickable side>
            <q-btn flat round dense icon="more_vert" @click.stop="">
              <q-menu>
                <q-list style="min-width: 100px">
                  <q-item clickable v-close-popup>
                    <q-item-section>{{ $t("ui.assign") }}</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="tagRename(index)">
                    <q-item-section>{{ $t("ui.rename") }}</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup>
                    <q-item-section>{{ $t("ui.delete") }}</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </q-item-section>
        </q-item> -->
      </template>
    </q-virtual-scroll>
  </q-scroll-area>
`,
}

export {
  Taglist
}