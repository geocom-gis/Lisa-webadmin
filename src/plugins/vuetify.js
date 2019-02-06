import Vue from "vue";
import Vuetify from "vuetify";
import "vuetify/src/stylus/app.styl";
import colors from "vuetify/es5/util/colors";

Vue.use(Vuetify, {
  iconfont: "md",
  theme: {
    primary: colors.green.darken1, // #E53935
    secondary: colors.green.lighten4, // #FFCDD2
    accent: colors.green.base // #3F51B5
  }
});
