/*!
 * helper-link-to <https://github.com/helpers/helper-link-to>
 *
 * Copyright (c) 2016, Brian Woodward.
 * Licensed under the MIT License.
 */

'use strict';

var relativePath = require('relative-dest');

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
 * @return {String} Relative path to the specified view from the current view.
 * @api public
 */

module.exports = function linkTo(key, collectionName) {
  var name = collectionName;
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
    return link(current, key);
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

  return link(current, target);
};

function link(current, target) {
  var fromDest = current.dest || current.path;
  var targetDest = target.dest || target.path;
  return relativePath(fromDest, targetDest);
}
