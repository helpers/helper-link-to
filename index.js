/*!
 * helper-link-to <https://github.com/helpers/helper-link-to>
 *
 * Copyright (c) 2016-2017, Brian Woodward.
 * Released under the MIT License.
 */

'use strict';

var relativePath = require('relative-dest');
var isObject = require('isobject');
var koalas = require('koalas');
var get = require('get-value');

/**
 * [templates][] helper that creates a link from the current view to the specified view
 * on the specified collection.
 *
 *
 * ```hbs
 * {{! Handlebars example linking from "home.html" to "about.html" in the default "pages" collection }}
 * <a href="{{link-to 'about'}}">About</a>
 * ```
 *
 *
 * ```hbs
 * {{! Handlebars example linking from "home.html" to "blog/post-1.html" in the "posts" collection }}
 * <a href="{{link-to 'post-1' 'posts'}}">Post 1</a>
 * ```
 * @param  {String|Object} `key` Name of the view to lookup to link to. May also pass in a view instance link to.
 * @param  {String} `collectionName` Name of the collection to lookup the view on. (Defaults to "pages")
 * @param  {Array} `props` Optional array of properties to check when getting the destination path from a view. May use dot notication (data.permalink). (Defaults to ["dest", "path"])
 * @return {String} Relative path to the specified view from the current view.
 * @api public
 */

module.exports = function linkTo(key, collectionName, props, options) {
  if (isOptions(props)) {
    options = props;
    if (Array.isArray(collectionName)) {
      props = collectionName;
      collectionName = null;
    } else {
      props = null;
    }
  }

  if (isOptions(collectionName)) {
    options = collectionName;
    collectionName = null;
  }

  var name = collectionName;
  props = props || ['data.path', 'dest', 'path'];

  // handlebars options
  if (typeof name === 'object') {
    name = null;
  }

  name = name || 'pages';

  if (!this || typeof this.app === 'undefined') {
    var msg = '[helper-link-to]: Requires an "app" created with "templates".';
    console.error(msg);
    return '';
  }

  var current = this.view || this.context.view;
  if (typeof key === 'object' && (key.isView || key.isItem)) {
    return link(current, key, props);
  }

  var collection = this.app[name];
  if (typeof collection === 'undefined') {
    var msg = '[helper-link-to]: Unable to find collection "' + name + '".';
    console.error(msg);
    return '';
  }

  var target;
  try {
    target = collection.getView(key);
  } catch (err) {
    var msg = '[helper-link-to]: Unable to find view "' + key + '" in collection "' + name + '".\n' + err.message;
    console.log(msg);
    return '';
  }

  if (!target || !Object.keys(target).length) {
    var msg = '[helper-link-to]: Unable to find view "' + key + '" in collection "' + name + '".';
    console.error(msg);
    return '';
  }

  return link(current, target, props);
};

function link(from, to, props) {
  var fromDest = dest(from, props);
  var toDest = dest(to, props);
  return relativePath(fromDest, toDest);
}

function dest(view, props) {
  if (typeof view === 'string') {
    return view;
  }
  return koalas.apply(koalas, props)
    .use(function(prop) {
      return get(view, prop);
    })
    .value();
}

function isOptions(val) {
  return isObject(val) && val.hash && isObject(val.hash);
}
