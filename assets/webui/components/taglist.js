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
    tagModified: function (tag) {
      this.$emit('modified')
    }
  },
  watch: {},
  mounted: function () {
  },
  template: String.raw`
  <!-- <div class="absolute-top bg-primary row items-center" style="height: 50px">
                                            <q-input dense borderless clearable v-model="tagfilter" placeholder="Filter..." class="full-width q-px-sm">
                                              <template v-slot:prepend>
                                                <q-icon name="filter_alt"></q-icon>
                                              </template>
                                            </q-input>
                                          </div> -->
  
  <q-scroll-area id="scroll-area-with-virtual-scroll-1"
    style="height: calc(100% - 0px); margin-top: 0px; border-right: 1px solid #ddd">
    <q-virtual-scroll :items="tags" scroll-target="#scroll-area-with-virtual-scroll-1 > .scroll"
      :virtual-scroll-item-size="48">
      <template v-slot="{item, index}">
        <q-item :key="item" clickable>
          <tag-edit :tag="item" @modified="tagModified(item)"></tag-edit>
          <q-item-section>
            <q-item-label lines="1">
              {{item}}
            </q-item-label>
          </q-item-section>
          <q-item-section clickable side>
            <q-btn flat round dense icon="north_east" @click.stop="tagSelected(item)">
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