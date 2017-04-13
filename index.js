/*!
 * helper-link-to <https://github.com/helpers/helper-link-to>
 *
 * Copyright (c) 2016-2017, Brian Woodward.
 * Released under the MIT License.
 */

'use strict';

var relativeDest = require('relative-dest');
var isObject = require('isobject');
var get = require('get-value');

/**
 * [templates][] helper that creates a link from the current view to the specified view
 * on the specified collection.
 *
 * ```hbs
 * {{! Handlebars example linking from "home.html" to "about.html" in the default "pages" collection }}
 * <a href="{{link-to 'about'}}">About</a>
 *
 * <!-- Handlebars example linking from "home.html" to "blog/post-1.html" in the "posts" collection -->
 * <a href="{{link-to 'post-1' 'posts'}}">Post 1</a>
 * ```
 * @param  {String|Object} `key` Name of the view to lookup to link to. May also pass in a view instance link to.
 * @param  {String} `name` (optional) Name of the collection to search for the view. (default="pages")
 * @param  {Array} `props` Optional array of properties to check when getting the destination path from a view. May use dot notication (data.permalink). (default=["data.path", "dest", "path"])
 * @return {String} Relative path to the specified view from the current view.
 * @api public
 */

module.exports = function linkTo(key, name, props, options) {
  var app = this && this.app;

  if (!isTemplates(app)) {
    throw new Error('expected "this.app" to be an instance of "templates"');
  }

  if (isOptions(name)) {
    options = name;
    name = null;
    props = null;
  }

  if (Array.isArray(name)) {
    options = props;
    props = name;
    name = null;
  }

  if (isOptions(props)) {
    options = props;
    props = null;
  }

  var paths = Array.isArray(props) ? props : ['data.path', 'dest', 'path'];
  if (!isString(name)) {
    name = 'pages';
  }

  var currentView = this.view || this.context.view;
  if (isView(key)) {
    return link(currentView, key, paths);
  }

  var collection = this.app[name];
  if (typeof collection === 'undefined') {
    error(this.app, 'collection "' + name + '" does not exist');
    return '';
  }

  var targetView = collection.getView(key);
  if (!isView(targetView)) {
    error(this.app, 'view "' + key + '" was not found in collection "' + name + '"');
    return '';
  }

  return link(currentView, targetView, paths);
};

function link(from, to, props) {
  return relativeDest(dest(from, props), dest(to, props));
}

function dest(view, paths) {
  var len = paths.length;
  var idx = -1;
  while (++idx < len) {
    var filepath = get(view, paths[idx]);
    if (filepath) {
      return filepath;
    }
  }
}

function isString(str) {
  return str && typeof str === 'string';
}

function isView(view) {
  return isObject(view) && (view.isView || view.isItem);
}

function isTemplates(app) {
  return isObject(app) && app.isTemplates;
}

function isOptions(val) {
  return isObject(val) && isObject(val.hash);
}

function error(app, msg) {
  if (app && app.hasListeners('error')) {
    app.emit('error', new Error(msg));
  } else {
    var args = [].slice.call(arguments, 1);
    args.unshift('helper-link-to:');
    console.error.apply(console, args);
  }
}
