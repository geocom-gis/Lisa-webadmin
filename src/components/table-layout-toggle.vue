<template>
  <div :style="toggleStyle">
    <v-btn-toggle
      v-model="tableViewType"
      light
      mandatory
      @change="$emit('change', $event);"
    >
      <v-btn flat> <v-icon>list</v-icon> </v-btn>
      <v-btn flat> <v-icon>view_module</v-icon> </v-btn>
    </v-btn-toggle>
  </div>
</template>
<script>
export default {
  props: {
    show: {
      type: Boolean,
      default: function() {
        return false;
      }
    },
    viewType: {
      type: Number,
      default: function() {
        return 0;
      }
    }
  },
  data() {
    return {
      tableViewType: this.viewType
    };
  },
  computed: {
    toggleStyle() {
      return this.show ? "" : "display:none;";
    }
  },
  watch: {
    viewType(val) {
      this.tableViewType = val;
    }
  }
};
</script>
