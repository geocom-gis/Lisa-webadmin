<template>
  <v-container v-if="uploadAttachment" grid-list-sm>
    <v-layout wrap>
      <v-flex xs12>
        <v-alert v-model="showError" type="error">{{ error }}</v-alert>
        <v-container grid-list-sm>
          <v-layout wrap>
            <template v-for="value in files">
              <v-flex :key="value.id" xs4>
                <div class="text-no-wrap text-truncate">{{ value.name }}</div>
                <template v-if="isImage(value)">
                  <v-img :src="getThumbUrl(value)">
                    <span>
                      <v-btn
                        title="Delete file"
                        flat
                        icon
                        color="red"
                        absolute
                        right
                        style="right:1px;background-color:white;"
                        @click="confirmDeleteAttachment(value);"
                      >
                        <v-icon>delete_forever</v-icon>
                      </v-btn>
                    </span>
                  </v-img>
                </template>
              </v-flex>
            </template>
          </v-layout>
        </v-container>
      </v-flex>
      <v-flex xs12>
        <file-upload
          color="primary"
          :url="fileUploadUrl"
          :headers="fileUploadHeaders"
          @error="onError"
          @success="onSuccess"
        ></file-upload>
      </v-flex>
      <v-dialog v-model="confirmDelete" persistent max-width="290">
        <v-card>
          <v-card-title class="headline">Delete file</v-card-title>
          <v-card-text
            >Are you sure to delete "{{ (selectedFile || {}).name }}"
            file?</v-card-text
          >
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" flat @click="selectedFile = null;">No</v-btn>
            <v-btn color="primary" @click="deleteAttachment();">Yes</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-layout>
  </v-container>
</template>

<script>
import Vue from "vue";
import FileUpload from "v-file-upload";
import Service from "./data-table-service";

Vue.use(FileUpload);

export default {
  components: {},
  inject: ["isLoading"],
  props: {
    tableInfo: {
      type: Object,
      default: function() {
        return {};
      }
    },
    objectId: {
      type: Number,
      default: function() {
        return -1;
      }
    }
  },
  data() {
    return {
      uploadAttachment: false,
      files: [],
      fileUploadUrl: "",
      fileUploadHeaders: {},
      error: null,
      selectedFile: null
    };
  },
  computed: {
    showError() {
      return this.error != null;
    },
    confirmDelete() {
      return this.selectedFile != null;
    }
  },
  watch: {
    objectId(val, oldVal) {
      this.uploadAttachment = false;
      this.fileUploadUrl = "";
      if (val && val >= 0) {
        this.fileUploadUrl = Service.getSaveAttachmentUrl(
          this.tableInfo.url,
          val
        );
        this.load();
      }
    }
  },
  methods: {
    isImage(file) {
      return file.contentType.indexOf("image/") != -1;
    },
    getThumbUrl(file) {
      var thumb = Service.getAttachmentUrl(
        this.tableInfo.url,
        this.objectId,
        file.id
      );

      console.log(thumb);
      return thumb;
    },
    confirmDeleteAttachment(file) {
      this.selectedFile = file;
    },
    deleteAttachment(confirmed) {
      if (this.selectedFile) {
        this.isLoading(true);
        Service.deleteAttachment(
          this.tableInfo.url,
          this.objectId,
          this.selectedFile.id
        )
          .then(this.load)
          .catch(this.onError);
      }
    },

    onSuccess(result) {
      this.$emit("success");
      this.load();
    },
    onError(error) {
      this.isLoading(false);
      error = error.target || error;
      this.$emit("error", error.response || error);
    },
    load() {
      this.isLoading(true);
      this.files.length = 0;
      this.selectedFile = null;
      this.uploadAttachment = true;
      this.error = null;
      Service.getAttachments(this.tableInfo.url, this.objectId)
        .then(this.onLoaded)
        .catch(this.onError);
    },

    onLoaded(data) {
      this.isLoading(false);
      data.forEach(file => {
        this.files.push(file);
      });
    }
  }
};
</script>

<style lang="stylus">
.file-upload {
  .input-wrapper {
    background-color: #9E9E9E !important;

    &:hover {
      background-color: #BDBDBD !important;
    }
  }
}
</style>
