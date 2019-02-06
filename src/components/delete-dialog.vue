<template>
  <v-dialog v-model="show" persistent max-width="300">
    <v-card>
      <v-card-title class="headline">{{ title }}: Delete item</v-card-title>
      <v-card-text>Are you sure to delete this item?</v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" flat @click="$emit('hide');">No</v-btn>
        <v-btn color="primary" @click="$emit('delete');">Yes</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
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
    title: {
      type: String,
      default: function() {
        return null;
      }
    }
  }
};
</script>
