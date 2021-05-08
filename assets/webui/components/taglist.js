// import { TagslistTemplate } from '../templates/tagslist-template.js'

var API

const Taglist = {
  setAPI: function (_API) {
    API = _API
  },
  props: [],
  data: function () {
    return {
      tagfilter: "",
      tags: [],
    }
  },
  methods: {
    apiCallFailed: function (error) {
      app.$q.notify('Looks like there was an API problem: ' + error)
    },
    refreshTags: function () {
      var rq = { tagsFilter: this.tagfilter }
      API.post("tags", rq).then(result => {
        Object.freeze(result.tags)
        this.tags = result.tags
      }).catch(this.apiCallFailed)
    },
  },
  mounted: function () {
    this.refreshTags()
  },
  template: String.raw`
  <div class="fit scroll">
    <div class="absolute-top bg-transparent" style="height: 150px">
      <q-input standout square dense v-model="tagfilter" label="Filter" @input="refreshTags" class="full-width">
        <template v-slot:append>
          <q-btn round dense flat icon="filter_alt" @click="refreshTags" />
        </template>
      </q-input>
    </div>
  
    <q-scroll-area id="scroll-area-with-virtual-scroll-1"
      style="height: calc(100% - 40px); margin-top: 40px; border-right: 1px solid #ddd">
      <q-virtual-scroll :items="tags" scroll-target="#scroll-area-with-virtual-scroll-1 > .scroll"
        :virtual-scroll-item-size="48">
        <template v-slot="{item, index}">
          <q-item :key="item" v-ripple>
            <q-item-section>
              <q-item-label>
                {{item}}
              </q-item-label>
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