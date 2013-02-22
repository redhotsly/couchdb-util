/*global emit:false*/
/*jshint node:true*/
"use strict";

module.exports = {
  "_id": "_design/types",
  "language": "javascript",
  "views": {
    "webservice": {
      "map": function (doc) {
        if(doc.type === "webservice") {
          emit(doc.type, doc);
        }
      },
      "reduce": "_count"
    },
    "crashoccurence": {
      "map": function (doc) {
        if(doc.type === "crashoccurence") {
          emit(doc.type, doc);
        }
      },
      "reduce": "_count"
    }
  }
};