'use strict';

require('mocha');
var capture = require('capture-stream');
var assemble = require('assemble-core');
var handlebars = require('handlebars');
var assert = require('assert');
var _ = require('lodash');
var helper = require('./');
var app;

function render(str, settings, ctx, cb) {
  if (typeof ctx === 'function') {
    cb = ctx; ctx = {};
  }
  cb(null, _.template(str, settings)(ctx));
}

describe('helper-link-to', function() {
  it('should show an error when used directly', function() {
    var restore = capture(process.stderr);
    var actual = helper();
    var output = restore(true);
    assert.equal(output, '[helper-link-to]: Requires an "app" created with "templates".\n');
    assert.equal(actual, '');
  });

  it('should show an error when `this.app` is `undefined`', function() {
    var restore = capture(process.stderr);
    var actual = helper.call({});
    var output = restore(true);
    assert.equal(output, '[helper-link-to]: Requires an "app" created with "templates".\n');
    assert.equal(actual, '');
  });

  it('should work as a lodash helper but show error because of missing `app`:', function () {
    var restore = capture(process.stderr);
    var actual = _.template('<%= linkTo() %>', {imports: {linkTo: helper}})();
    var output = restore(true);
    assert.equal(output, '[helper-link-to]: Requires an "app" created with "templates".\n');
    assert.equal(actual, '');
  });

  it('should work as a handlebars helper but show error because of missing `app`:', function () {
    var restore = capture(process.stderr);
    handlebars.registerHelper('link-to', helper);
    var actual = handlebars.compile('{{link-to}}')();
    var output = restore(true);
    assert.equal(output, '[helper-link-to]: Requires an "app" created with "templates".\n');
    assert.equal(actual, '');
  });

  describe('with app', function() {
    beforeEach(function () {
      app = assemble();
      app.engine('hbs', require('engine-handlebars'));
      app.engine('md', require('engine-base'));

      // custom view collections
      app.create('pages', {engine: 'hbs'});
      app.create('posts', {engine: 'md'});

      // add helper
      app.helper('linkTo', helper);
    });

    describe('engine-handlebars', function() {
      it('should render link with default collection:', function (cb) {
        app.page('abc', {path: 'abc.html', content: 'abc'});
        app.page('def', {path: 'def.html', content: 'foo {{linkTo "abc"}} bar'})
          .render(function (err, res) {
            if (err) return cb(err);
            assert.equal(res.content, 'foo ./abc.html bar');
            cb();
          });
      });

      it('should render link with specified collection:', function (cb) {
        app.post('abc', {path: 'abc.html', content: 'abc'});
        app.page('def', {path: 'def.html', content: 'foo {{linkTo "abc" "posts"}} bar'})
          .render(function (err, res) {
            if (err) return cb(err);
            assert.equal(res.content, 'foo ./abc.html bar');
            cb();
          });
      });

      it('should show error message when collection does not exist:', function (cb) {
        var restore = capture(process.stderr);
        app.post('abc', {path: 'abc.html', content: 'abc'});
        app.page('def', {path: 'def.html', content: 'foo {{linkTo "abc" "foos"}} bar'})
          .render(function (err, res) {
            if (err) return cb(err);
            var output = restore(true);
            assert.equal(output, '[helper-link-to]: Unable to find collection "foos".\n');
            assert.equal(res.content, 'foo  bar');
            cb();
          });
      });

      it('should show error message when target view does not exist:', function (cb) {
        var restore = capture(process.stderr);
        app.page('abc', {path: 'abc.html', content: 'abc'});
        app.page('def', {path: 'def.html', content: 'foo {{linkTo "foo"}} bar'})
          .render(function (err, res) {
            if (err) return cb(err);
            var output = restore(true);
            assert.equal(output, '[helper-link-to]: Unable to find view "foo" in collection "pages".\n');
            assert.equal(res.content, 'foo  bar');
            cb();
          });
      });

      it('should render link when `dest` exists on views:', function (cb) {
        app.page('abc', {path: 'abc.hbs', dest: 'abc.html', content: 'abc'});
        app.page('def', {path: 'def.hbs', dest: 'def.html', content: 'foo {{linkTo "abc"}} bar'})
          .render(function (err, res) {
            if (err) return cb(err);
            assert.equal(res.content, 'foo ./abc.html bar');
            cb();
          });
      });
    });

    describe('engine-base', function() {
      it('should render link with default collection:', function (cb) {
        app.page('uvw', {path: 'uvw.html', content: 'uvw'});
        app.page('xyz', {path: 'xyz.html', content: 'foo <%= linkTo("uvw") %> bar'})
          .render({engine: 'md'}, function (err, res) {
            if (err) return cb(err);
            assert.equal(res.content, 'foo ./uvw.html bar');
            cb();
          });
      });

      it('should render link with specified collection:', function (cb) {
        app.post('uvw', {path: 'uvw.html', content: 'uvw'});
        app.page('xyz', {path: 'xyz.html', content: 'foo <%= linkTo("uvw", "posts") %> bar'})
          .render({engine: 'md'}, function (err, res) {
            if (err) return cb(err);
            assert.equal(res.content, 'foo ./uvw.html bar');
            cb();
          });
      });

      it('should show error message when collection does not exist:', function (cb) {
        var restore = capture(process.stderr);
        app.post('uvw', {path: 'uvw.html', content: 'uvw'});
        app.page('xyz', {path: 'xyz.html', content: 'foo <%= linkTo("uvw", "foos") %> bar'})
          .render({engine: 'md'}, function (err, res) {
            if (err) return cb(err);
            var output = restore(true);
            assert.equal(output, '[helper-link-to]: Unable to find collection "foos".\n');
            assert.equal(res.content, 'foo  bar');
            cb();
          });
      });

      it('should show error message when target view does not exist:', function (cb) {
        var restore = capture(process.stderr);
        app.post('uvw', {path: 'uvw.html', content: 'uvw'});
        app.page('xyz', {path: 'xyz.html', content: 'foo <%= linkTo("foo", "posts") %> bar'})
          .render({engine: 'md'}, function (err, res) {
            if (err) return cb(err);
            var output = restore(true);
            assert.equal(output, '[helper-link-to]: Unable to find view "foo" in collection "posts".\n');
            assert.equal(res.content, 'foo  bar');
            cb();
          });
      });

      it('should render link when `dest` exists on views:', function (cb) {
        app.post('uvw', {path: 'uvw.md', dest: 'uvw.html', content: 'uvw'});
        app.post('xyz', {path: 'xyz.md', dest: 'xyz.html', content: 'foo <%= linkTo("uvw", "posts") %> bar'})
          .render(function (err, res) {
            if (err) return cb(err);
            assert.equal(res.content, 'foo ./uvw.html bar');
            cb();
          });
      });
    });
  });
});
