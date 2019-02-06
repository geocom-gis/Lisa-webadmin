<template>
  <v-select
    item-text="title"
    item-value="id"
    label="Select table"
    :items="items"
    @change="$emit('change', $event);"
  ></v-select>
</template>
<script>
export default {
  props: {
    items: {
      type: Array,
      default: function() {
        return [];
      }
    }
  }
};
</script>
