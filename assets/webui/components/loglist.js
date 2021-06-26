// import { TagslistTemplate } from '../templates/tagslist-template.js'
var API

const LogList = {
  init: function (_API) {
    API = _API
  },
  components: {},
  // props: {
  //   // logs: Array
  // },
  data: function () {
    return {
      link: "bla",
      logs: [
        {
          error: "Action 1 failed",
          time: Date(Date.now()),
          elements: [
            {
              error: "some error here",
              file: "/file/path/a"
            },
            {
              error: "another one there",
              file: "/file/path/b"
            },
          ]
        },
        {
          error: "Action 2 some other event",
          time: Date(Date.now()),
          elements: [
            {
              error: "error 1",
              file: "/file/path/1"
            },
            {
              error: "error 2",
              file: "/file/path/2"
            },
          ]
        },
      ]
    }
  },
  methods: {
    apiCallFailed: function (error) {
      this.$q.notify('Looks like there was an API problem: ' + error)
    },
    logSelected: function (files) {
      this.$emit('logSelected', files)
    },
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
  <q-scroll-area id="scroll-area-with-virtual-scroll-logs" style="height: calc(100% - 0px); margin-top: 0px">
    <q-virtual-scroll :items="logs" scroll-target="#scroll-area-with-virtual-scroll-logs > .scroll"
      :virtual-scroll-item-size="24">
      <template v-slot="{item, index}">
        <q-expansion-item expand-separator :active="link === index" @click="link=index" :key="index"
          :content-inset-level="0.25" :label="item.error" :caption="item.time.toString()">
          <q-item v-for="(e,ei) in item.elements" :key="ei" clickable dense>
            <q-item-section>
              <q-item-label lines="1">
                {{e.error}}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-expansion-item>
      </template>
    </q-virtual-scroll>
  </q-scroll-area>
`,
}

export {
  LogList
}