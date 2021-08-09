var API

import { File } from './file.js'

const FileList = {
  init: function (_API) {
    API = _API
    File.init(API)
    //FileEdit.init(API)
  },
  components: {
    'file': File,
  },
  props: {
    files: Array
  },
  data: function () {
    return {}
  },
  methods: {
    // fileSelected: function (tag) {
    //   this.$emit('tagSelected', tag)
    // }
  },
  template: String.raw`
  <div id="fileList" class="scroll" style="height: calc(100% - 0px); margin-top: 0px;">
    <!-- <q-table virtual-scroll :pagination.sync="pagination" :rows-per-page-options="[0]" row-key="index" :data="files"
          :columns="columns" class="fit">
        </q-table> -->

    <q-virtual-scroll :items="files" scroll-target="#fileList" :virtual-scroll-item-size="48">
      <template v-slot="{item, index}">
        <file :file="item"></file>
      </template>
    </q-virtual-scroll>
  </div>

`,
}

export {
  FileList
}