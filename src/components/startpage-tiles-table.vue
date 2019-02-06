<template>
  <v-item-group style="overflow-x:auto">
    <v-layout v-if="!rows || rows.length <= 0" justify-center align-center>
      <div>No data available</div>
    </v-layout>
    <table v-if="rows && rows.length > 0" class="elevation-1 tiles-data-table">
      <tbody>
        <template v-for="(item, itemKey) in tiles">
          <tr :key="itemKey">
            <template v-for="(col, key) in item.cols">
              <v-item :key="key">
                <td
                  slot-scope="{
                    active,
                    toggle
                  }"
                  :rowspan="col.rowspan"
                  :colspan="col.colspan"
                  @mouseenter="toggle();"
                  @mouseleave="toggle();"
                  @dblclick="$emit('edit', col.data);"
                >
                  <div class="fill-height v-item--content">{{ col.title }}</div>
                  <transition name="fade">
                    <div v-if="active" class="tile-actions">
                      <v-btn
                        title="Edit"
                        flat
                        icon
                        @click="$emit('edit', col.data);"
                      >
                        <v-icon color="accent">edit</v-icon>
                      </v-btn>
                      <v-btn
                        title="Delete"
                        flat
                        icon
                        @click="$emit('delete', col.data);"
                      >
                        <v-icon color="accent">delete</v-icon>
                      </v-btn>
                    </div>
                  </transition>
                </td>
              </v-item>
            </template>
          </tr>
        </template>
      </tbody>
    </table>
  </v-item-group>
</template>
<script>
export default {
  props: {
    show: {
      type: Boolean,
      default: function() {
        return null;
      }
    },
    rows: {
      type: Array,
      default: function() {
        return null;
      }
    }
  },
  data() {
    return {
      tiles: [],
      initialized: false
    };
  },
  watch: {
    rows(val) {
      this.initialized = false;
      this.initializeTiles();
    },
    show(val) {
      this.initializeTiles();
    }
  },
  methods: {
    initializeTiles() {
      if (!this.initialized) {
        this.tiles = [];
      }
      if (this.initialized || !this.show || !this.rows) {
        return;
      }

      console.debug("initialize-tiles-table");
      this.initialized = true;

      let sorted = this.rows.slice().sort((a, b) => {
        return a.POS_ROW - b.POS_ROW;
      });

      debugger;

      let lastRowNo = -1;
      let obj;
      sorted.forEach(row => {
        if (!row.ACTIVE) {
          return;
        }

        if (lastRowNo < row.POS_ROW) {
          this.fillRows(obj);
          lastRowNo = row.POS_ROW;
          obj = { cols: [] };
          this.tiles.push(obj);
        }

        let col = { data: row };
        obj.cols.push(col);
        col.col = row.POS_COLUMN;
        col.row = row.POS_ROW;
        col.colspan = row.POS_COLSPAN;
        col.rowspan = row.POS_ROWSPAN;
        col.title = row.TITLE_LANG1;
      });

      this.fillRows(obj);
    },

    fillRows(obj) {
      if (!obj || !obj.cols) {
        return;
      }

      obj.cols = obj.cols.sort((a, b) => {
        return a.col - b.col;
      });
      let rowHeight = 10000000;
      obj.cols.forEach(col => {
        if (col.rowspan < rowHeight) {
          rowHeight = col.rowspan;
        }
      });

      for (let i = 0; i < rowHeight - 1; i++) {
        this.tiles.push({});
      }
    }
  }
};
</script>
<style lang="stylus">
cell-size = 100;
tbl-width = (cell-size * 6) px;
tbl-height = (cell-size * 6) px;

.v-item--active {
  background-color: #E0E0E0;

  .v-item--content {
    opacity: 0.8;
  }
}

.tile-actions {
  position: relative;
  margin-top: -48px; /* vuetify btn height */
  overflow: hidden;
  white-space: nowrap;
  width: 100%;
}

.tiles-data-table {
  width: tbl-width;
  max-width: tbl-width;
  min-width: tbl-width;
  height: tbl-height;
  max-height: tbl-heigh;
  min-height: tbl-height;
  background: white;
  border-radius: 2px;
  border-collapse: collapse;
  border-spacing: 0;

  tbody {
    tr {
      border: 0;
      height: cell-size px;
      max-height: cell-size px;
      min-height: cell-size px;
    }

    td {
      width: cell-size px;
      max-width: cell-size px;
      min-width: cell-size px;
      height: cell-size px;
      max-height: cell-size px;
      min-height: cell-size px;
      overflow: hidden;
      border: 1px solid grey;
      text-align: center;
      vertical-align: middle;
      text-overflow: ellipsis;
    }
  }

  .fade-enter-active, .fade-leave-active {
    transition: opacity 0.5s;
  }

  .fade-enter, .fade-leave-to { /* .fade-leave-active below version 2.1.8 */
    opacity: 0;
  }
}
</style>
