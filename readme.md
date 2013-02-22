couchdb util
===============

This program is used to update couch design documents (view definitions) by reading view definitions from a files.

Usage:
---------

- edit option.js to change db URL
- create one or many .view.js files as node modules that return a view definition.

  ```javascript
  module.exports = {
    "_id": "_design/types",
    "language": "javascript",
    "views": {
      "myview1": {
        "map": function (doc) {
            emit(doc.type, doc);
        }
      }
    }
  };
  ```

- invoke cu by passing the folder containing the views and options

    node cu.js ./views


Tips:
---------

- since a .view.js is itself a node program, it can dynamically generate a design document.

