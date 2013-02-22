/*global emit:false*/
/*jshint node:true*/
"use strict";

module.exports = {
  "_id": "_design/default",
  "language": "javascript",
  "views": {
    "webservicesTotalCountPerDate": {
      "map": function (doc) {
        if(doc.type == "webservice") {
          emit(doc.date, doc.all_tot);
        }
      }
    },
    "webservicesIncidentSaveCountPerDate ": {
      "map": function (doc) {
        if(doc.type == "webservice") {
          emit(doc.date, doc.incidentsaves_tot);
        }
      }
    }
  }
};