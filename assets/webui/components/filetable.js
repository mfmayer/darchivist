var API
//import { FileEdit } from './filedit.js'

const FileTable = {
  init: function (_API) {
    API = _API
    //FileEdit.init(API)
  },
  components: {
    //'tag-edit': TagEdit,
  },
  props: {
    files: Array
  },
  data: function () {
    return {
      pagination: {
        rowsPerPage: 0
      },

      columns: [
        // { name: 'index', label: '#', align: 'left', field: 'index' },
        { name: 'name', label: 'name', align: 'left', field: row => row.name },
      ]
    }
  },
  methods: {
    apiCallFailed: function (error) {
      this.$q.notify('Looks like there was an API problem: ' + error)
    },
    // fileSelected: function (tag) {
    //   this.$emit('tagSelected', tag)
    // }
  },
  template: String.raw`
  <div style="height: calc(100% - 0px); margin-top: 0px;">
    <q-table virtual-scroll :pagination.sync="pagination" :rows-per-page-options="[0]" row-key="index" :data="files"
      :columns="columns" class="fit">
    </q-table>
  </div>
`,
}

export {
  FileTable
}