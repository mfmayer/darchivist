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
      activeLogIndex: null,
      logs: [
        // {
        //   label: "Action 1 failed",
        //   time: new Date(Date.now()),
        //   files: [
        //     "/file/path/a", "/file/path/b"
        //   ],
        //   subLabels: [
        //     "some error here", "another error there"
        //   ]
        // },
        // {
        //   label: "Action 2 some other event",
        //   time: new Date(Date.now()),
        //   files: [
        //     "/file/path/1", "/file/path/2"
        //   ],
        //   subLabels: [
        //     "error 1", "error 2"
        //   ],
        // },
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
    expanded: function (item, index) {
      if (this.activeLogIndex !== null && index != this.activeLogIndex) {
        this.$refs["log-" + this.activeLogIndex].hide()
      }
      this.activeLogIndex = index
    }
  },
  watch: {
    logs: {
      handler (newVal, oldVal) {
        this.activeLogIndex = null
      }
    }
  },
  mounted: function () {
  },
  template: String.raw`
  <q-scroll-area id="scroll-area-with-virtual-scroll-logs" style="height: calc(100% - 0px); margin-top: 0px">
    <q-virtual-scroll :items="logs" scroll-target="#scroll-area-with-virtual-scroll-logs > .scroll"
      :virtual-scroll-item-size="24">
      <template v-slot="{item, index}">
        <q-expansion-item expand-separator :active="link === index" @click="link=index" :key="index" :ref="'log-'+index"
          :content-inset-level="0.25" :label="item.label" :caption="item.time.toLocaleString()"
          @show="expanded(item,index)">
          <q-item v-for="(subLabel,subLabelIdx) in item.subLabels" :key="subLabelIdx" clickable dense>
            <q-item-section>
              <q-item-label lines="1">
                {{subLabel}}
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