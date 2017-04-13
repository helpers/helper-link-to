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
    assert.throws(function() {
      helper();
    }, /templates/);
  });

  it('should show an error when `this.app` is `undefined`', function() {
    assert.throws(function() {
      helper.call({});
    }, /templates/);
  });

  it('should work as a lodash helper but show error because of missing `app`:', function () {
    assert.throws(function() {
      _.template('<%= linkTo() %>', {imports: {linkTo: helper}})();
    }, /templates/);
  });

  it('should work as a handlebars helper but show error because of missing `app`:', function () {
    handlebars.registerHelper('link-to', helper);
    assert.throws(function() {
      handlebars.compile('{{link-to}}')();
    }, /templates/);
  });

  describe('with app', function() {
    beforeEach(function () {
      app = assemble();
      app.option('engine', 'hbs');
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
            assert.equal(output, 'helper-link-to: collection "foos" does not exist\n');
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
            assert.equal(output, 'helper-link-to: view "foo" was not found in collection "pages"\n');
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

      it('should render link when `key` is a view instance:', function(cb) {
        app.preCompile(/def\.hbs/, function(file, next) {
          file.data.related = app.pages.getView('abc');
          next();
        });

        app.page('abc', {path: 'abc.hbs', dest: 'abc.html', content: 'abc'});
        app.page('def', {path: 'def.hbs', dest: 'def.html', content: 'foo {{linkTo related}} bar'})
          .render(function(err, res) {
            if (err) return cb(err);
            assert.equal(res.content, 'foo ./abc.html bar');
            cb();
          });
      });

      it('should render link when `key` is a view path:', function(cb) {
        app.preCompile(/def\.hbs/, function(file, next) {
          file.data.related = app.pages.getView('abc');
          next();
        });

        app.page('abc', {path: 'abc.hbs', dest: 'abc.html', content: 'abc'});
        app.page('def', {path: 'def.hbs', dest: 'def.html', content: 'foo {{linkTo related.path}} bar'})
          .render(function(err, res) {
            if (err) return cb(err);
            assert.equal(res.content, 'foo ./abc.html bar');
            cb();
          });
      });

      it('should render link using custom props with default collection:', function(cb) {
        app.onLoad(/\.hbs$/, function(file, next) {
          file.data.permalink = `blog/2017/02/09/${file.stem}.html`;
        });

        app.page('abc', {path: 'abc.hbs', dest: 'abc.html', content: 'abc'});
        app.page('def', {path: 'def.hbs', dest: 'def.html', content: 'foo {{linkTo "abc" props}} bar'})
          .render({props: ['data.permalink', 'path']}, function(err, res) {
            if (err) return cb(err);
            assert.equal(res.content, 'foo ./abc.html bar');
            cb();
          });
      });

      it('should render link using custom props with custom collection:', function(cb) {
        app.onLoad(/\.hbs$/, function(file, next) {
          file.data.permalink = `blog/2017/02/09/${file.stem}.html`;
        });

        app.post('abc', {path: 'abc.hbs', dest: 'abc.html', content: 'abc'});
        app.page('def', {path: 'def.hbs', dest: 'def.html', content: 'foo {{linkTo "abc" "posts" props}} bar'})
          .render({props: ['data.permalink', 'path']}, function(err, res) {
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
            assert.equal(output, 'helper-link-to: collection "foos" does not exist\n');
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
            assert.equal(output, 'helper-link-to: view "foo" was not found in collection "posts"\n');
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

      it('should render link when `key` is a view instance:', function(cb) {
        app.preCompile(/xyz\.md/, function(file, next) {
          file.data.related = app.posts.getView('uvw');
          next();
        });

        app.post('uvw', {path: 'uvw.md', dest: 'uvw.html', content: 'uvw'});
        app.post('xyz', {path: 'xyz.md', dest: 'xyz.html', content: 'foo <%= linkTo(related) %> bar'})
          .render(function(err, res) {
            if (err) return cb(err);
            assert.equal(res.content, 'foo ./uvw.html bar');
            cb();
          });
      });

      it('should render link when `key` is a view path:', function(cb) {
        app.preCompile(/xyz\.md/, function(file, next) {
          file.data.related = app.posts.getView('uvw');
          next();
        });

        app.post('uvw', {path: 'uvw.md', dest: 'uvw.html', content: 'uvw'});
        app.post('xyz', {path: 'xyz.md', dest: 'xyz.html', content: 'foo <%= linkTo(related.path, "posts") %> bar'})
          .render(function(err, res) {
            if (err) return cb(err);
            assert.equal(res.content, 'foo ./uvw.html bar');
            cb();
          });
      });

      it('should render link using custom props with default collection:', function(cb) {
        app.onLoad(/\.md$/, function(file, next) {
          file.data.permalink = `blog/2017/02/09/${file.stem}.html`;
        });

        app.page('uvw', {path: 'uvw.md', dest: 'uvw.html', content: 'uvw'});
        app.post('xyz', {path: 'xyz.md', dest: 'xyz.html', content: 'foo <%= linkTo("uvw", props) %> bar'})
          .render({props: ['data.permalink', 'path']}, function(err, res) {
            if (err) return cb(err);
            assert.equal(res.content, 'foo ./uvw.html bar');
            cb();
          });
      });

      it('should render link using custom props with custom collection:', function(cb) {
        app.onLoad(/\.md$/, function(file, next) {
          file.data.permalink = `blog/2017/02/09/${file.stem}.html`;
        });

        app.post('uvw', {path: 'uvw.md', dest: 'uvw.html', content: 'uvw'});
        app.post('xyz', {path: 'xyz.md', dest: 'xyz.html', content: 'foo <%= linkTo("uvw", "posts", props) %> bar'})
          .render({props: ['data.permalink', 'path']}, function(err, res) {
            if (err) return cb(err);
            assert.equal(res.content, 'foo ./uvw.html bar');
            cb();
          });
      });
    });
  });
});
