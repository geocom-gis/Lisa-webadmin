<template style="width:100%">
  <v-layout column>
    <v-layout wrap>
      <v-flex xs12 sm6 md4>
        <table-select
          :items="webmapTables"
          @change="selectedTableId = $event;"
        />
      </v-flex>
    </v-layout>
    <v-divider />
    <template v-if="selectedTableId != null">
      <v-card-text class="title">{{ table.title }}</v-card-text>
      <v-layout row>
        <action-buttons @addNew="onCreateItem();" />
        <v-spacer />
        <table-layout-toggle
          :show="showTableLayoutToggle"
          :view-type="tableViewType"
          @change="tableViewType = $event;"
        />
      </v-layout>
      <v-flex xs12>
        <startpage-tiles-table
          v-show="tableViewType == 1"
          :show="tableViewType == 1"
          :rows="rows"
          @edit="onEditItem($event);"
          @delete="onDeleteItem($event);"
        />
        <v-data-table
          v-show="tableViewType == 0"
          :headers="headers"
          :items="rows"
          :pagination.sync="pagination"
          item-key="GlobalID"
          class="elevation-1"
        >
          <template slot="headers" slot-scope="props">
            <tr>
              <th></th>
              <template v-for="header in props.headers">
                <th
                  v-if="showInTable(header.value)"
                  :key="header.text"
                  :class="[
                    'column sortable',
                    pagination.descending ? 'desc' : 'asc',
                    header.value === pagination.sortBy ? 'active' : ''
                  ]"
                  @click="changeSort(header.value);"
                >
                  <v-icon small>arrow_upward</v-icon>
                  {{ header.text }}
                </th>
              </template>
            </tr>
          </template>
          <template slot="items" slot-scope="props">
            <tr @dblclick="onEditItem(props.item);">
              <td class="justify-center layout px-0">
                <v-btn
                  title="Edit"
                  small
                  flat
                  icon
                  @click="onEditItem(props.item);"
                >
                  <v-icon style="color:#616161">edit</v-icon>
                </v-btn>
                <v-btn
                  title="Delete"
                  small
                  flat
                  icon
                  @click="onDeleteItem(props.item);"
                >
                  <v-icon style="color:#616161">delete</v-icon>
                </v-btn>
              </td>
              <template v-for="(value, key) in props.item">
                <td
                  v-if="showInTable(key)"
                  :key="getUUID(value)"
                  style="max-width:200px;"
                  class="text-no-wrap text-truncate"
                >
                  {{ formatCellValue(value, key) }}
                </td>
              </template>
            </tr>
          </template>
        </v-data-table>
      </v-flex>

      <edit-dialog
        :table="table"
        :data="data"
        :headers="headers"
        :hiden-fields="hidenTableFields"
        :show="dialog"
        :title="formTitle"
        :edited-item="editedItem"
        :error-message="lastErrorMessage"
        :supports-attachments="supportsAttachments"
        :unique-id-field-name="uniqueIdFieldName"
        @hide="dialog = false;"
        @save="saveItem();"
        @error="onFormError($event);"
      />
      <delete-dialog
        :show="deletedDialog"
        :title="table.title"
        @hide="deletedDialog = false;"
        @delete="deleteItem();"
      />
    </template>
  </v-layout>
</template>

<script>
import Service from "./data-table-service";
import TableSelect from "./table-select";
import DeleteDialog from "./delete-dialog";
import EditDialog from "./edit-dialog";
import StartpageTilesTable from "./startpage-tiles-table";
import TableLayoutToggle from "./table-layout-toggle";
import ActionButtons from "./action-buttons";

export default {
  inject: ["logError", "isLoading"],
  components: {
    "table-select": TableSelect,
    "delete-dialog": DeleteDialog,
    "edit-dialog": EditDialog,
    "startpage-tiles-table": StartpageTilesTable,
    "table-layout-toggle": TableLayoutToggle,
    "action-buttons": ActionButtons
  },
  props: {
    webmapId: {
      type: String,
      default: function() {
        return null;
      },
      required: true
    },
    domain: {
      type: String,
      default: function() {
        return null;
      }
    },
    config: {
      type: Object,
      default: function() {
        return { tables: {} };
      }
    }
  },
  data() {
    return {
      tableViewType: 0,
      showTableLayoutToggle: false,

      webmapTables: [],
      selectedTableId: null,
      supportsAttachments: false,
      data: {},
      table: {},
      dialog: false,
      deletedDialog: false,
      lastErrorMessage: null,
      editedItem: {},
      itemToDelete: null,
      defaultItem: {},
      pagination: {
        sortBy: "OBJECTID",
        rowsPerPage: 25
      },
      headers: [],
      rows: [],
      hidenTableFields: ["OBJECTID", "GlobalID", "Shape_Length", "Shape_Area"],
      uniqueIdFieldName: null,
      isStartpage: false
    };
  },
  computed: {
    editerObjectId() {
      return this.editedItem[this.uniqueIdFieldName];
    },
    formTitle() {
      let title =
        this.table.title +
        ": " +
        (this.editedItem[this.uniqueIdFieldName] ? "Edit item" : "Add item");
      return title;
    }
  },
  watch: {
    dialog(val) {
      val || this.close();
    },
    selectedTableId(val) {
      if (val) {
        this.loadTableData(val);
      }
    },

    isStartpage(val) {
      this.showTableLayoutToggle = val;

      if (!val) {
        this.tableViewType = 0;
        return;
      }
      // by default show tiles?
      this.tableViewType = 1;
    }
  },
  created: function() {
    Service.setWebMapId(this.domain, this.webmapId);
    this.logError();
    this.isLoading(true);
    this.loadTables();
  },
  methods: {
    formatCellValue(value, fieldName) {
      const field = this.headers.find(h => h.value === fieldName);
      if (field.relationInfo) {
        try {
          const option = field.relationInfo.options.find(o => {
            return o.id === value;
          });
          return option.name;
        } catch (error) {
          console.error("Failed to resolve relation value. Error:", error);
        }
      }

      return value;
    },
    getUrl() {
      return this.table.url;
    },
    getUUID(value) {
      return Service.generateUUID();
    },
    showInTable(fieldName) {
      return !this.hidenTableFields.includes(fieldName);
    },
    changeSort(column) {
      if (this.pagination.sortBy === column) {
        this.pagination.descending = !this.pagination.descending;
      } else {
        this.pagination.sortBy = column;
        this.pagination.descending = false;
      }
    },
    close() {
      this.lastErrorMessage = null;
      this.editedItem = {};
    },
    compare(a, b, propName) {
      if (a[propName] < b[propName]) return -1;
      if (a[propName] > b[propName]) return 1;
      return 0;
    },

    loadTables() {
      this.isLoading(true);
      Service.getMapDefinition()
        .then(this.onTablesLoaded)
        .catch(this.onError);
    },
    onTablesLoaded(def) {
      this.isLoading(false);
      const tables = (def.tables || []).sort((a, b) =>
        this.compare(a, b, "title")
      );
      this.webmapTables = tables;
    },
    loadTableData(tableItemId) {
      this.defaultItem = {};
      this.table = {};
      this.isLoading(true);
      Service.getTableData(tableItemId)
        .then(this.onTableDataLoaded)
        .catch(this.onError);
    },
    onFormError(error) {
      if (!error) {
        this.lastErrorMessage = null;
        return;
      }

      let message = error.message || error;
      message = message.target || message;
      this.lastErrorMessage = message;
    },
    onError(error) {
      this.isLoading(false);
      this.logError(error.message || error);
    },
    getTableConfig(tableName) {
      if (this.config && this.config.tables) {
        return this.config.tables[tableName];
      }

      return null;
    },
    getFieldTitle(field, tableConfig) {
      let fieldTitle = field.alias;
      if (tableConfig && tableConfig.fields && tableConfig.fields.length > 0) {
        const fieldCfg = tableConfig.fields.find(
          _ => _.name.toLowerCase() === field.name.toLowerCase()
        );
        if (fieldCfg) {
          fieldTitle = fieldCfg.alias;
        }
      }

      return fieldTitle;
    },
    initializeTableHeaders(table, data) {
      let tableHeaders = [];
      let tableConfig = this.getTableConfig(table.info.name);
      data.fields.forEach(field => {
        this.defaultItem[field.name] = field.defaultValue;
        const fieldTitle = this.getFieldTitle(field, tableConfig);
        tableHeaders.push({
          text: fieldTitle,
          align: "left",
          sortable: true,
          value: field.name,
          isreadonly: !field.editable,
          required: !field.nullable,
          domain: field.domain,
          relationInfo: field.relationInfo,
          maxLength: field.length
        });
      });

      return tableHeaders;
    },
    onTableDataLoaded(data) {
      this.isLoading(false);
      console.debug(data);
      this.data = data;
      this.table = data.table || {};
      this.isStartpage = this.table.info.name.indexOf("Startpage") != -1;
      const tableHeaders = this.initializeTableHeaders(this.table, data);
      this.headers = tableHeaders;
      this.rows = data.rows;
      this.uniqueIdFieldName = data.uniqueIdFieldName;
      this.supportsAttachments = this.table.hasAttachments;
    },
    onCreateItem() {
      this.editedItem = Object.assign({}, this.defaultItem);
      this.dialog = true;
    },

    onEditItem(item) {
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    onDeleteItem(item) {
      this.itemToDelete = item;
      this.deletedDialog = true;
    },
    deleteItem() {
      this.isLoading(true);
      Service.deleteItem(this.getUrl(), this.itemToDelete)
        .then(() => {
          this.deletedDialog = false;
          this.onFormError();
          this.itemToDelete = null;
          this.isLoading(false);
          this.loadTableData(this.selectedTableId);
        })
        .catch(error => {
          this.onFormError(error);
          this.isLoading(false);
        });
    },

    saveItem() {
      this.isLoading(true);
      (this.editedItem[this.uniqueIdFieldName]
        ? Service.updateItem(this.getUrl(), this.editedItem)
        : Service.createItem(this.getUrl(), this.editedItem)
      )
        .then(() => {
          this.dialog = false;
          this.onFormError();
          this.editedItem = {};
          this.isLoading(true);
          this.loadTableData(this.selectedTableId);
        })
        .catch(error => {
          this.onFormError(error);
          this.isLoading(false);
        });
    }
  }
};
</script>
<style lang="stylus"></style>
