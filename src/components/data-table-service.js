import esriHttpRequest from "./esri-http-request";
import Auth from "./auth";
import moment from "moment";

let mapUrlTemplate =
  "https://{domain}/sharing/rest/content/items/{webmapId}/data";
let mapUrl = "";

var mapDefinitionCache;

export default {
  setWebMapId(domain, webmapId) {
    mapUrl = mapUrlTemplate
      .replace("{webmapId}", webmapId)
      .replace("{domain}", domain);
  },
  getMapDefinition() {
    return new Promise((resolve, reject) => {
      if (mapDefinitionCache) {
        resolve(mapDefinitionCache);
        return;
      }

      esriHttpRequest
        .send(mapUrl)
        .then(response => {
          mapDefinitionCache = response;
          resolve(response);
        })
        .catch(error => {
          if (error.name === "ArcGISAuthError") {
            if (!Auth.authenticate()) {
              reject("Please login again");
            }
            return;
          }
          reject(error);
        });
    });
  },
  createItem(url, item) {
    console.debug("create item:", url, item);
    return new Promise((resolve, reject) => {
      esriHttpRequest
        .send(url + "/addFeatures" + esriHttpRequest.itemToQueryParams(item))
        .then(response => {
          if (esriHttpRequest.isErrorResponse(response, reject)) {
            return;
          }
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  updateItem(url, item) {
    console.debug("update item:", url, item);
    return new Promise((resolve, reject) => {
      esriHttpRequest
        .send(url + "/updateFeatures" + esriHttpRequest.itemToQueryParams(item))
        .then(response => {
          if (esriHttpRequest.isErrorResponse(response, reject)) {
            return;
          }
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },
  deleteItem(url, item) {
    console.debug("delete item:", url, item);
    return new Promise((resolve, reject) => {
      esriHttpRequest
        .send(
          url +
            "/deleteFeatures" +
            esriHttpRequest.itemsToIdsQueryParams([item])
        )
        .then(response => {
          if (esriHttpRequest.isErrorResponse(response, reject)) {
            return;
          }
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  isDate(field) {
    return field.type === "esriFieldTypeDate";
  },

  isNumber(field) {
    return field.type === "esriFieldTypeInteger";
  },
  formatDate(unixDate) {
    if (unixDate) {
      return moment(unixDate).format("YYYY-MM-DD");
    }
    return unixDate;
  },
  getTableData(tableItemId) {
    return new Promise((resolve, reject) => {
      this.getTableById(tableItemId)
        .then(table => {
          var baseUrl = table.url.substr(0, table.url.lastIndexOf("/") + 1);
          this.getTableInfo(table.url)
            .then(info => {
              let hasAttachments = info.hasAttachments;
              this.getData(table.url)
                .then(data => {
                  var featureData = data.features.map(item => {
                    return item.attributes;
                  });

                  var dateFields = [];
                  if (data.fields) {
                    for (let index = 0; index < data.fields.length; index++) {
                      const field = data.fields[index];
                      if (this.isDate(field)) {
                        dateFields.push(field.name);
                      }
                    }
                  }

                  featureData.forEach(feature => {
                    dateFields.forEach(dateField => {
                      feature[dateField] = this.formatDate(feature[dateField]);
                    });
                  });

                  this.resolveRelationships(info, baseUrl)
                    .then(() => {
                      resolve({
                        fields: info.fields,
                        rows: featureData,
                        uniqueIdFieldName: data.uniqueIdField.name,
                        table: {
                          id: table.id,
                          title: table.title,
                          url: table.url,
                          hasAttachments: hasAttachments,
                          info: info
                        }
                      });
                    })
                    .catch(error => {
                      reject(error);
                    });
                })
                .catch(error => {
                  reject(error);
                });
            })
            .catch(error => {
              reject(error);
            });
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  resolveRelationships(info, baseUrl) {
    return new Promise((resolve, reject) => {
      var relInfo = info.relationships;
      var fields = info.fields;
      console.debug("table info:", info);
      if (relInfo == null || relInfo.length === 0) {
        resolve(null);
        return;
      }

      var oneToOneRel = [];
      relInfo.forEach(rel => {
        if (
          rel.cardinality === "esriRelCardinalityOneToOne" &&
          rel.role === "esriRelRoleDestination"
        ) {
          var field = fields.find(f => {
            return f.name === rel.keyField;
          });
          field.relationInfo = { options: [], tableId: rel.relatedTableId };
          oneToOneRel.push(field);
        }
      });

      if (oneToOneRel.length === 0) {
        resolve(null);
        return;
      }

      var todos = oneToOneRel.length;
      oneToOneRel.forEach(field => {
        var relationInfo = field.relationInfo;
        var url = baseUrl + relationInfo.tableId;
        this.getTableInfo(url)
          .then(relTblInfo => {
            console.debug("rel tbl:", relTblInfo);
            var relDisplayFld = relTblInfo.displayField;
            this.getData(url)
              .then(data => {
                todos--;
                var relFeatures = data.features;
                relFeatures.forEach(feature => {
                  relationInfo.options.push({
                    name: feature.attributes[relDisplayFld],
                    id: feature.attributes.GlobalID
                  });
                });

                if (todos <= 0) {
                  console.debug("One-to-one relationships:", oneToOneRel);
                  resolve(oneToOneRel);
                }
              })
              .catch(error => {
                reject(error);
              });
          })
          .catch(error => {
            reject(error);
          });
      });
    });
  },
  getData(url) {
    var query = esriHttpRequest.encodeQueryData({
      f: "json",
      where: "1=1",
      outFields: "*"
    });
    return esriHttpRequest.send(url + "/query?" + query);
  },
  getTableInfo(url) {
    var query = esriHttpRequest.encodeQueryData({
      f: "json"
    });
    return esriHttpRequest.send(url + "/?" + query);
  },
  getTableById(tableItemId) {
    return new Promise((resolve, reject) => {
      this.getMapDefinition()
        .then(def => {
          var tables = def.tables || [];
          var table;
          tables.forEach(tbl => {
            if (tbl.id === tableItemId) {
              table = tbl;
            }
          });
          if (!table) {
            reject("Error: Table not found! id=" + tableItemId);
            return;
          }
          resolve(table);
        })
        .catch(error => {
          reject(error);
        });
    });
  },
  getAttachments(url, objectId) {
    console.debug("get attachments:", url, objectId);
    var query = esriHttpRequest.encodeQueryData({
      f: "json",
      objectIds: [objectId]
    });
    return new Promise((resolve, reject) => {
      esriHttpRequest
        .send(url + "/queryAttachments?" + query)
        .then(response => {
          if (esriHttpRequest.isErrorResponse(response, reject)) {
            return;
          }
          console.debug("queryAttachments:", response);
          const groups = response.attachmentGroups || [];
          if (groups.length <= 0) {
            resolve([]);
          } else {
            resolve(groups[0].attachmentInfos || []);
          }
        })
        .catch(error => {
          reject(error);
        });
    });
  },
  deleteAttachment(url, objectId, id) {
    console.debug("delete attachments:", url, objectId, id);
    var query = esriHttpRequest.encodeQueryData({
      f: "json",
      attachmentIds: [id]
    });
    return new Promise((resolve, reject) => {
      esriHttpRequest
        .send(url + "/" + objectId + "/" + "deleteAttachments?" + query)
        .then(response => {
          if (esriHttpRequest.isErrorResponse(response, reject)) {
            return;
          }

          resolve((response.attachmentGroups || [{}])[0].attachmentInfos || []);
        })
        .catch(error => {
          reject(error);
        });
    });
  },
  getSaveAttachmentUrl(url, objectId) {
    return url + "/" + objectId + "/addAttachment?f=json&token=" + Auth.token();
  },

  getAttachmentUrl(url, objectId, id) {
    return (
      url + "/" + objectId + "/attachments/" + id + "?token=" + Auth.token()
    );
  },
  generateUUID() {
    // Public Domain/MIT
    var d = new Date().getTime();
    if (
      typeof performance !== "undefined" &&
      typeof performance.now === "function"
    ) {
      d += performance.now(); //use high-precision timer if available
    }
    var newGuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function(c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
      }
    );

    return newGuid;
  }
};
