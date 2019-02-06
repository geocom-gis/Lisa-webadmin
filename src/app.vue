<template>
  <v-app light>
    <v-dialog
      v-model="loader"
      :transition="false"
      persistent
      fullscreen
      content-class="loading-dialog"
    >
      <v-container fill-height>
        <v-layout row justify-center align-center>
          <v-progress-circular
            :size="50"
            color="primary"
            style="z-index:999999"
            indeterminate
          ></v-progress-circular>
        </v-layout>
      </v-container>
    </v-dialog>

    <v-toolbar app>
      <v-toolbar-title>Lisa webadmin</v-toolbar-title>
      <v-spacer></v-spacer>

      <v-list-tile v-if="isAuthenticated">
        <v-icon>account_box</v-icon>
        <span style="max-width:200px;" class="text-no-wrap text-truncate">{{
          username
        }}</span>
      </v-list-tile>
      <v-spacer></v-spacer>
      <v-btn
        v-if="isAuthenticated"
        outline
        small
        color="primary"
        title="Logout"
        @click="logout"
      >
        <v-icon>lock_open</v-icon>
      </v-btn>
      <v-btn
        v-if="!isAuthenticated"
        outline
        small
        color="primary"
        title="Login"
        @click="login"
      >
        <v-icon>lock</v-icon>
      </v-btn>
    </v-toolbar>

    <v-content>
      <v-alert
        v-model="showError"
        transition="slide-y-transition"
        class="my-2"
        type="error"
        >{{ errorMessage }}</v-alert
      >
      <v-container fluid>
        <DataTable
          style="width:100%;"
          :domain="domain"
          :webmap-id="webmapId"
          :config="config"
        />
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import Vue from "vue";
import auth from "./components/auth.js";
import DataTable from "./components/data-table";

export default {
  name: "App",
  components: { DataTable },
  data: () => ({
    clientId: null,
    domain: null,
    webmapId: null,
    config: null,
    loader: false,
    errorMessage: null,
    userName: null
  }),
  provide() {
    return {
      logError: this.logError,
      isLoading: this.isLoading
    };
  },
  computed: {
    showError() {
      return this.errorMessage != null;
    },
    isAuthenticated() {
      return auth.isAuthenticated();
    }
  },

  created: function() {
    this.clientId = this.$parent.$data.clientId;
    this.domain = this.$parent.$data.domain;
    this.webmapId = this.$parent.$data.webmapId;
    this.config = this.$parent.$data.config;

    if (!this.webmapId || !this.clientId || !this.domain) {
      window.alert(
        "Error: webmapId, clientId and domain attributes must not be empty!"
      );
      return;
    }

    auth.setClientId(this.clientId);

    if (window.location.hash.indexOf("access_token") !== -1) {
      this.completeLogin();
    }
    this.username = (auth.session() || {}).username;
  },

  methods: {
    logout() {
      auth.logout();
      this.refreshView();
    },
    refreshView() {
      window.location.href = window.location.href;
    },
    completeLogin() {
      // this call will close this popup window
      auth.completeOAuth2();
      window.location.href = window.location.href.replace(
        window.location.hash,
        ""
      );
    },
    login() {
      auth.authenticate("force");
    },
    logError: function(message) {
      this.errorMessage = message;
    },
    isLoading: function(loading) {
      this.loader = loading;
    }
  }
};
</script>
<style>
/* IE11 FIX for "No overflow in content when width:100%" */
.v-content__wrap,
.application--wrap {
  width: 100%;
}
.loading-dialog {
  background-color: #212121;
  opacity: 0.46;
}
</style>
