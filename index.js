/*!
 * helper-link-to <https://github.com/helpers/helper-link-to>
 *
 * Copyright (c) 2016, Brian Woodward.
 * Licensed under the MIT License.
 */

'use strict';

var relativePath = require('relative-dest');

module.exports = function linkTo(key, collectionName) {
  var name = collectionName;
  if (typeof name === 'object') {
    name = null;
  }

  name = name || 'pages';

  if (!this || typeof this.app === 'undefined') {
    var msg = 'helper-link-to requires that it is used in an `app` created with `templates`.';
    console.error(msg);
    return '';
  }

  var collection = this.app[name];
  if (typeof collection === 'undefined') {
    var msg = 'Invalid collection `' + name + '`.';
    console.error(msg);
    return '';
  }

  var current = this.context.view;
  var target = collection.getView(key);

  if (!target || !Object.keys(target).length) {
    var msg = 'Unable target find `' + key + '` in `' + name + '`.';
    console.error(msg);
    return '';
  }

  var fromDest = current.dest || current.path;
  var targetDest = target.dest || target.path;
  return relativePath(fromDest, targetDest);
};
