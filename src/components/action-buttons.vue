<template>
  <div>
    <v-btn color="primary" @click="$emit('addNew');">Add new</v-btn>
    <span class="hidden-sm-and-down"
      >(double click to edit row
      <v-icon small style="color:#616161">edit</v-icon>)
    </span>
  </div>
</template>
