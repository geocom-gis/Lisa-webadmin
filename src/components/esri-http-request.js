//import fetch from "node-fetch";

import "isomorphic-fetch";
import "isomorphic-form-data";
import { request } from "@esri/arcgis-rest-request";
import auth from "./auth.js";

export default {
  send: function(url) {
    return request(url, {
      authentication: auth.session()
    });
  },
  encodeQueryData: function(data) {
    const ret = [];
    for (let d in data)
      ret.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
    return ret.join("&");
  },
  isErrorResponse(response, errorCallback) {
    var results =
      response.addResults ||
      response.updateResults ||
      response.deleteResults ||
      [];
    var errors = [];
    results.forEach(res => {
      if (!res.success) {
        errors.push(res);
      }
    });

    if (errors.length > 0) {
      var errorMsg = errors[0].error.description;
      console.error(errors);
      errorCallback(errorMsg);
      return true;
    }

    return false;
  },
  itemToQueryParams(item) {
    var dataStr = JSON.stringify({ attributes: item });
    var urlParams = "[" + dataStr + "]";
    var queryParams = "?f=json&features=" + urlParams;
    return queryParams;
  },
  itemsToIdsQueryParams(items) {
    var objectIds = [];
    items.forEach(item => {
      objectIds.push(item.OBJECTID);
    });

    var queryParams = "?f=json&objectIds=" + objectIds.join(",");
    return queryParams;
  }
};
