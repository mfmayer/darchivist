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
  
  <!-- <q-scroll-area id="tagList" style="height: calc(100% - 0px); margin-top: 0px; border-right: 1px solid #ddd"> -->
  <div id="tagList" class="scroll" style="height: calc(100% - 0px); margin-top: 0px;">
    <q-virtual-scroll :items="tags" scroll-target="#tagList" :virtual-scroll-item-size="48">
      <template v-slot="{item, index}">
        <tag :tag="item" @modified="tagModified(item)" @selected="tagSelected"></tag>
      </template>
    </q-virtual-scroll>
  </div>
  <!-- </q-scroll-area> -->
`,
}

export {
  Taglist
}