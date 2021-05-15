// import { TagslistTemplate } from '../templates/tagslist-template.js'
var API
import { TagEdit } from './tagedit.js'

const Taglist = {
  setAPI: function (_API) {
    API = _API
    TagEdit.setAPI(API)
  },
  components: {
    'tag-edit': TagEdit,
  },
  props: {
    filteredTags: Array
  },
  data: function () {
    return {
      tagfilter: "",
      tags: [],
    }
  },
  methods: {
    apiCallFailed: function (error) {
      this.$q.notify('Looks like there was an API problem: ' + error)
    },
    // refreshTags: function () {
    //   var rq = { tagsFilter: this.tagfilter }
    //   API.post("tags", rq).then(result => {
    //     Object.freeze(result.tags)
    //     this.tags = result.tags
    //   }).catch(this.apiCallFailed)
    // },
  },
  watch: {
    tagfilter: {
      immediate: true,
      handler (newVal, oldVal) {
        var rq = { tagsFilter: newVal }
        API.post("tags", rq).then(result => {
          Object.freeze(result.tags)
          this.tags = result.tags
        }).catch(this.apiCallFailed)
      }
    }
  },
  mounted: function () {
  },
  template: String.raw`
  <div class="fit scroll">
    <div class="absolute-top bg-primary row items-center" style="height: 50px">
      <q-input dense borderless clearable v-model="tagfilter" placeholder="Filter..." class="full-width q-px-sm">
        <template v-slot:prepend>
          <q-icon name="filter_alt"></q-icon>
        </template>
      </q-input>
    </div>
  
    <q-scroll-area id="scroll-area-with-virtual-scroll-1"
      style="height: calc(100% - 50px); margin-top: 50px; border-right: 1px solid #ddd">
      <q-virtual-scroll :items="filteredTags" scroll-target="#scroll-area-with-virtual-scroll-1 > .scroll"
        :virtual-scroll-item-size="48">
        <template v-slot="{item, index}">
          <q-item :key="item" clickable>
            <tag-edit :tag="item"></tag-edit>
            <q-item-section>
              <q-item-label lines="1">
                {{item}}
              </q-item-label>
            </q-item-section>
            <q-item-section clickable side>
              <q-btn flat round dense icon="north_east" @click.stop>
              </q-btn>
            </q-item-section>
          </q-item>
        </template>
      </q-virtual-scroll>
    </q-scroll-area>
  </div>
`,
}

export {
  Taglist
}