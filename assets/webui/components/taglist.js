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
    tags: Array,
    selectedTags: Array,
  },
  data: function () {
    return {}
  },
  methods: {
    // tagSelected: function (tag) {
    //   this.$emit('tagSelected', tag)
    // },
    // tagDeselected: function (tag) {
    //   this.$emit('tagDeselected', tag)
    // },
    // tagModified: function (tag) {
    //   this.$emit('modified', selectedTags)
    // }
  },
  watch: {},
  mounted: function () {
  },
  template: String.raw`
  
  <!-- <q-scroll-area id="tagList" style="height: calc(100% - 0px); margin-top: 0px; border-right: 1px solid #ddd"> -->
  <div class="column no-scroll" style="height: calc(100% - 0px); margin-top: 0px; max-width:100%;">
  
    <!-- <q-toolbar class="bg-secondary" style="min-height:40px;">
          <q-btn flat round dense icon="filter_list" size="12px" />
        </q-toolbar> -->
    <div class="q-pa-xs q-gutter-xs full-width bg-primary text-white">
      <q-icon v-if="selectedTags.length > 0" name="cancel" style="font-size: 24px;" class="q-ma-xs cursor-pointer"
        @click.stop="$emit('allDeselected')"></q-icon>
      <q-icon v-else name="style" style="font-size: 24px;" class="q-ma-xs"></q-icon>
      <template v-for="(tag, index) in selectedTags">
        <q-chip dense removable color="secondary" @remove="$emit('deselected',tag)" :label="tag"></q-chip>
      </template>
    </div>
    <div id="tagList" class="scroll col fit">
      <q-virtual-scroll :items="tags" scroll-target="#tagList" :virtual-scroll-item-size="48">
        <template v-slot="{item, index}">
          <tag :tag="item" @modified="$emit('modified',item.name)" @selected="$emit('selected',item.name)" @deselected="$emit('deselected',item.name)"></tag>
        </template>
      </q-virtual-scroll>
    </div>
  
  </div>
  <!-- </q-scroll-area> -->
`,
}

export {
  Taglist
}