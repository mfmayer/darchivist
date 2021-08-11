var API

var created = 0

const File = {
  init: function (_API) {
    API = _API
  },
  data: function () {
    let c = created
    created = created + 1
    return {
      // created: c,
      // skeleton: true,
      // fileInfo: Object,
      confirmDelete: false
    }
  },
  props: {
    // file: String,
    index: Number,
    fileInfo: Object
  },
  methods: {
    apiCallFailed: function (error) {
      this.$q.notify('Looks like there was an API problem: ' + error)
    },
    deleteTag: function (tag) {
    },
    // getData: function() {
    //   //console.log("getData: " + this.index + " " + this.file)
    //   this.skeleton = true
    //   var rq = {
    //     fileInfos: [this.file],
    //   }
    //   API.post("fileInfo", rq).then(response => {
    //     if (response !== undefined) {
    //       this.fileInfo = response.fileInfos[0]
    //       this.skeleton = false
    //       console.log("   got: " + this.index + " " + this.file + " " + this.skeleton)
    //     }
    //   }).catch(this.apiCallFailed)
    // },
  },
  watch: {
    fileInfo: function (newFile, oldFile) {
      // console.log("watch: " + this.index + " " + oldFile + " " + newFile)
      //this.getData()
    }
  },
  // beforeUpdate: function() {
  //   // this.skeleton = true
  //   // console.log("updated: " + this.index + " " + this.created + " " + this.file)
  // },
  // updated: function() {
  //   // this.skeleton = true
  //   // console.log("updated: " + this.index + " " + this.created + " " + this.file)
  //   // this.getData()
  // },
  // created: function() {
  //   this.skeleton = true
  //   console.log("created: " + this.index + " " + this.created + " " + this.file)
  //   this.getData()
  //   //this.getData()
  //   // file: function(val) {
  //   //   console.log("watch: " + this.file)
  //   //   var rq = {
  //   //     fileInfos: [this.file],
  //   //   }
  //   //   API.post("fileInfo", rq).then(response => {
  //   //     if (response !== undefined) {
  //   //       this.fileInfo = response.fileInfos[0]
  //   //       //console.log(this.fileInfo.name)
  //   //     }
  //   //   }).catch(this.apiCallFailed)
  //   // },
  // },
  template: String.raw`
  <q-item :key="index" clickable @click="$emit('selected',fileInfo.path)">
    <!-- <tag-edit :tag="item" :ref="'tagEdit' + index" @modified="tagModified(item)"></tag-edit> -->
    <q-item-section side>
      <q-avatar square size="42px">
        <img src="assets/pdf-files.svg">
      </q-avatar>
    </q-item-section>  
    <q-item-section top>
      <q-item-label lines="1">
        <span class="text-weight-medium">{{fileInfo.name}}.{{fileInfo.fileExtension}}</span>
      </q-item-label>
      <q-item-label caption lines="5">
        <template v-for="(tag, index) in fileInfo.tags">
          <q-chip dense removable color="info" @remove="deleteTag(tag)">{{tag}}</q-chip>
        </template>
      </q-item-label>
      <q-item-label caption>{{fileInfo.size}}</q-item-label>
    </q-item-section>
    <q-item-section side>
      <q-btn class="gt-xs" size="12px" flat dense round icon="more_vert" @click.stop="">
        <q-menu>
          <q-list style="min-width: 100px">
            <q-item clickable v-close-popup>
              <q-item-section>{{ $t("ui.assign") }}</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="">
              <q-item-section>{{ $t("ui.rename") }}</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="confirmDelete=true">
              <q-item-section>{{ $t("ui.delete") }}</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </q-item-section>
  </q-item>`
}

export {
  File
}