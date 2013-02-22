/*global __dirname:false*/
/*jshint node:true*/
"use strict";

var fs = require('fs');
var request = require('request');
var async = require('async');
var step = require('step');


//////////////////////////////////////////////////////
// reads all files in the given directory
//////////////////////////////////////////////////////

function getDesignDocuments(folder, callback) {

  var viewDefs = [];

  fs.readdir(folder, function (err, files) {

    if(err) {
      callback(err);
      return;
    }

    files.forEach(function (file) {

      if(file.match(/.*\.view\.js/)) {

        console.log('reading ', file);
        var def = getDesignDocument(file);
        viewDefs.push(def);

      }

    });

    callback(null, viewDefs);
    return;

  });

}


//////////////////////////////////////////////////////
// Extract a Couchdb design document from a file
//////////////////////////////////////////////////////

function getDesignDocument(file) {

  var designDoc = require(folder + '/' + file);

  Object.keys(designDoc.views).forEach(function (viewName) {

    var view = designDoc.views[viewName];
    Object.keys(view).forEach(function (funcName) {

      var func = view[funcName];

      if(func) {
        view[funcName] = func.toString();
      }

    });
  });

  //var designDocJson = JSON.stringify(designDoc);
 // return designDocJson;
  return designDoc;
}


//////////////////////////////////////////////////////
// Get revision for doc
//////////////////////////////////////////////////////

function getRev(docId, options, callback) {
  var u = options.db + docId;
  var req = request(u, function function_name(err, res, body) {
    if(!err && res.statusCode == 200 ) {
      var jsonBody = JSON.parse(body);
      callback(null, jsonBody._rev);
    } else {
      callback(err || res.statusCode );
    }
  });
}

//////////////////////////////////////////////////////
// Loads the options
//////////////////////////////////////////////////////

function loadOptions(callback) {

  fs.readFile(folder + '/options.js', function (err, data) {
    if(err) {
      callback(err);
      return;
    }
    var options = JSON.parse(data);
    callback(null, options);
  });
}


//////////////////////////////////////////////////////
// Update the given document
//////////////////////////////////////////////////////

function updateDesignDoc(doc, options, callback) {
  var u = options.db + doc._id;

  var opt = {
    url: u,
    json: doc
  };

  var req = request.put(opt, function (err, res, body) {
    if(!err && (res.statusCode == 200 || res.statusCode == 201)) {
      callback(null);
    } else {
      callback(err || res.statusCode );
    }
  });

}


//////////////////////////////////////////////////////
// Sets the _rev for each of the given doc by getting the
// current rev from couch
//////////////////////////////////////////////////////

function updateRevs(docs, callback) {
  async.forEachLimit(docs, 5, function (doc, cb) {

    getRev(doc._id, options, function (err, rev) {

      // todo: handle new docs
      if(err) {
        throw err;
      }

      doc._rev = rev;
      cb();
    });

  }, function () {
    callback(null, docs);
  });

}


//////////////////////////////////////////////////////
// Update the docs in couchdb
//////////////////////////////////////////////////////
function saveDocs(docs, callback) {
  async.forEachLimit(docs, 5, function (doc, cb) {

    updateDesignDoc(doc, options, function (err) {

      // todo:
      if(err) {
        throw err;
      }

      console.log(doc._id + ' updated');

      cb();

    });

  }, callback);
}

//////////////////////////////////////////////////////
// Main program
//////////////////////////////////////////////////////
var options;
var folder = process.argv[2];

step(

  // read options
  function (err) {
    loadOptions(this);
  },
  // find doc to process
  function (err, o) {
    if(err) throw err;

    options = o;
    getDesignDocuments(folder, this);
  },
  // update docs to latest _rev to ensure save will not be rejected
  function (err, docs) {
    if(err) throw err;
    var callback = this;

    updateRevs(docs, function () {
      callback(null, docs);
    });

  },
  // save docs
  function (err, docs) {

    if(err) throw err;
    var callback = this;

    saveDocs(docs, function () {
      callback(null, docs);
    });

  },
  // report error/sucess
  function (err) {
    if(err) throw err;
    console.log('done');
  }

);