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
    // },
    // getItems (from, size) {
    //   console.log("getItems: " + from + " - " + size)
    //   var items = new Array(size).fill(null)
    //   if (size <= 0) {
    //     // return Object.freeze(items)
    //     return items
    //   }
    //   var rq = {
    //     fileInfos: this.files.slice(from, from + size),
    //   }
    //   API.post("fileInfo", rq).then(response => {
    //     if (response !== undefined && response.fileInfos !== undefined && response.fileInfos.length == size) {
    //       for (let i=0; i<size; ++i) {
    //         // items[i].name = response.fileInfos[i].name
    //         items[i].name = "blubb"
    //       }
    //       // items = response.fileInfos
    //     }
    //   }).catch(this.apiCallFailed)
    //   // return Object.freeze(items)
    //   return items
    // },
    // getItems (from, size) {
    //   return (
    //     new Array(size).fill(null).map((_, i) => ({ page: from + i }))
    //   )
    },
    template: String.raw`
  <div id="fileList" class="scroll" style="height: calc(100% - 0px); margin-top: 0px;">
    <!-- <q-table virtual-scroll :pagination.sync="pagination" :rows-per-page-options="[0]" row-key="index" :data="files"
                    :columns="columns" class="fit">
                  </q-table> -->
  
    <q-virtual-scroll :items="files" scroll-target="#fileList" :virtual-scroll-item-size="65" separator>
      <!-- <q-virtual-scroll :items-fn="getItems" :items-size="files.length" scroll-target="#fileList" :virtual-scroll-item-size="48"> -->
      <template v-slot="{item, index}">
        <!-- <file :file="item"></file> -->
        <file :fileInfo="item" :index="index"></file>        
      </template>
    </q-virtual-scroll>
  </div>

`,
  }

export {
    FileList
  }