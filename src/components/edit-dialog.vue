<template>
  <v-dialog v-model="show" persistent max-width="1200">
    <v-card>
      <v-card-title class="headline grey lighten-2" primary-title>
        {{ title }}
        <v-spacer></v-spacer>
        <v-btn color="primary" flat @click="$emit('hide');">cancel</v-btn>
        <v-btn color="primary" :disabled="!formValid" @click="$emit('save');"
          >save</v-btn
        >
      </v-card-title>
      <v-alert v-model="showError" type="error">{{ errorMessage }}</v-alert>
      <v-card-actions> <v-spacer></v-spacer> </v-card-actions>
      <v-form v-model="formValid">
        <v-card-text>
          <v-container grid-list-sm>
            <v-layout wrap>
              <template v-for="(value, key) in editedItem">
                <template v-if="isDate(key)">
                  <v-flex v-if="isVisible(key)" :key="key" xs12 sm6 md4 xl3>
                    <v-menu
                      :ref="'menu_' + key"
                      :close-on-content-click="true"
                      :nudge-right="40"
                      lazy
                      transition="scale-transition"
                      offset-y
                      full-width
                    >
                      <v-text-field
                        slot="activator"
                        v-model="editedItem[key]"
                        :class="isFieldRequired(key)"
                        :rules="getRequiredRule(key)"
                        :label="getFieldName(key)"
                        prepend-icon="event"
                      ></v-text-field>
                      <v-date-picker
                        v-model="editedItem[key]"
                        no-title
                        :first-day-of-week="1"
                        scrollable
                      ></v-date-picker>
                    </v-menu>
                  </v-flex>
                </template>
                <template v-else-if="isDomain(key)">
                  <v-flex v-if="isVisible(key)" :key="key" xs12 sm6 md4 xl3>
                    <v-select
                      v-model="editedItem[key]"
                      :items="getDomainItems(key)"
                      item-text="name"
                      item-value="code"
                      :label="getFieldName(key)"
                      :rules="getRequiredRule(key)"
                      :class="isFieldRequired(key)"
                    ></v-select>
                  </v-flex>
                </template>
                <template v-else-if="isRelation(key)">
                  <v-flex v-if="isVisible(key)" :key="key" xs12 sm6 md4 xl3>
                    <v-select
                      v-model="editedItem[key]"
                      :items="getRelationItems(key)"
                      item-text="name"
                      item-value="id"
                      :label="getFieldName(key)"
                      :rules="getRequiredRule(key)"
                      :class="isFieldRequired(key)"
                    ></v-select>
                  </v-flex>
                </template>
                <template v-else>
                  <v-flex v-if="isVisible(key)" :key="key" xs12 sm6 md4 xl3>
                    <v-text-field
                      v-model="editedItem[key]"
                      :type="getType(key)"
                      :rules="getRules(key)"
                      :label="getFieldName(key)"
                      :class="isFieldRequired(key)"
                    ></v-text-field>
                  </v-flex>
                </template>
              </template>
            </v-layout>
          </v-container>
        </v-card-text>
        <esri-attachments
          v-if="supportsAttachments"
          :object-id="editerObjectId"
          :table-info="table"
          @error="$emit('error', $event);"
        />
        <v-divider />
      </v-form>
    </v-card>
  </v-dialog>
</template>
<script>
import Vue from "vue";
import Service from "./data-table-service";
import EsriAttachments from "./esri-attachments";

export default {
  inject: ["logError", "isLoading"],
  components: {
    "esri-attachments": EsriAttachments
  },
  props: {
    data: {
      type: Object,
      default: function() {
        return null;
      }
    },
    table: {
      type: Object,
      default: function() {
        return null;
      }
    },
    headers: {
      type: Array,
      default: function() {
        return null;
      }
    },
    hidenFields: {
      type: Array,
      default: function() {
        return [];
      }
    },
    show: {
      type: Boolean,
      default: function() {
        return false;
      }
    },
    editedItem: {
      type: Object,
      default: function() {
        return null;
      }
    },
    title: {
      type: String,
      default: function() {
        return null;
      }
    },
    errorMessage: {
      type: String,
      default: function() {
        return null;
      }
    },
    supportsAttachments: {
      type: Boolean,
      default: function() {
        return false;
      }
    },
    uniqueIdFieldName: {
      type: String,
      default: function() {
        return null;
      }
    }
  },
  data() {
    return {
      formValid: true,
      // check Vuetify Validation: expected an array of callback functions, that returns true or the error message
      rules: {
        required: value => !!value || "Required.",
        email: value => {
          const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          return pattern.test(value) || "Invalid e-mail.";
        }
      }
    };
  },
  computed: {
    editerObjectId() {
      return this.editedItem[this.uniqueIdFieldName];
    },
    showError() {
      return this.errorMessage != null;
    }
  },
  watch: {
    dialog(val) {
      val || this.close();
    }
  },
  methods: {
    getType(fieldName) {
      let isNumber = false;
      this.data.fields.forEach(field => {
        if (field.name === fieldName && Service.isNumber(field)) {
          isNumber = true;
        }
      });

      return isNumber ? "number" : "text";
    },
    isDomain(fieldName) {
      const header = this.headers.find(h => h.value === fieldName);
      if (header.value === fieldName && header.domain) {
        return true;
      }

      return false;
    },
    isRelation(fieldName) {
      const header = this.headers.find(h => h.value === fieldName);
      if (header.value === fieldName && header.relationInfo) {
        return true;
      }

      return false;
    },
    isDate(fieldName) {
      const field = this.data.fields.find(f => f.name === fieldName);
      return Service.isDate(field);
    },
    isVisible(fieldName) {
      return (
        !this.hidenFields.includes(fieldName) && !this.isReadonly(fieldName)
      );
    },
    isReadonly(fieldName) {
      const header = this.headers.find(h => h.value === fieldName);
      return header.isreadonly;
    },
    isFieldRequired(fieldName) {
      const header = this.headers.find(h => h.value === fieldName);
      return header.required ? "fld-required" : "";
    },
    getRules(fieldName) {
      let rules = this.getRequiredRule(fieldName);
      const header = this.headers.find(h => h.value === fieldName);
      if (header.maxLength) {
        let maxLength = header.maxLength;
        rules.push(
          value =>
            !value ||
            (value && value.length <= maxLength) ||
            "Max " + maxLength + " characters"
        );
      }

      return rules;
    },
    getRequiredRule(fieldName) {
      let rules = [];
      const header = this.headers.find(h => h.value === fieldName);
      if (header.required) rules.push(this.rules.required);
      return rules;
    },
    getFieldName(fieldName) {
      const header = this.headers.find(h => h.value === fieldName);
      return header.text;
    },
    getDomainItems(fieldName) {
      let codedValues = [];
      const header = this.headers.find(h => h.value === fieldName);
      if (header.domain && header.domain.codedValues) {
        codedValues = (header.domain.codedValues || []).slice(0); // make a copy
        codedValues.unshift({
          name: "",
          code: null
        });
      } else if (header.domain && header.domain.range) {
        //TODO: esriFieldTypeInteger (use Ticks in slider) or esriFieldTypeDouble
        // <v-slider :max="max" :min="min" v-model="slider" :thumb-size="24" thumb-label="always"></v-slider>
      }
      return codedValues;
    },
    getRelationItems(fieldName) {
      let options = [];
      const header = this.headers.find(h => h.value === fieldName);
      if (header.relationInfo && header.relationInfo.options) {
        options = (header.relationInfo.options || []).slice(0); // make a copy
        options.unshift({
          name: "",
          id: null
        });
      }

      return options;
    }
  }
};
</script>
<style lang="stylus">
.fld-required {
  label:after {
    color: red;
    content: ' *';
    display: inline;
  }
}
</style>
