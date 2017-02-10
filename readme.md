# helper-link-to [![NPM version](https://img.shields.io/npm/v/helper-link-to.svg?style=flat)](https://www.npmjs.com/package/helper-link-to) [![NPM monthly downloads](https://img.shields.io/npm/dm/helper-link-to.svg?style=flat)](https://npmjs.org/package/helper-link-to)  [![NPM total downloads](https://img.shields.io/npm/dt/helper-link-to.svg?style=flat)](https://npmjs.org/package/helper-link-to) [![Linux Build Status](https://img.shields.io/travis/helpers/helper-link-to.svg?style=flat&label=Travis)](https://travis-ci.org/helpers/helper-link-to)

> Templates helper that returns a link path from the current view to the another view.

## Install

Install with [npm](https://www.npmjs.com/):

```sh
$ npm install --save helper-link-to
```

## Usage

This helper should be used with an `app` created with [templates](https://github.com/jonschlinkert/templates) or something that inherits from [templates](https://github.com/jonschlinkert/templates). See [related projects](#related-projects) for some apps that use [templates](https://github.com/jonschlinkert/templates)

### With [assemble](https://github.com/assemble/assemble) and [engine-handlebars](https://github.com/jonschlinkert/engine-handlebars)

Setup the helper by registering it with the app:

```js
// assemble is a descendant of `templates`
var app = assemble();
app.engine('hbs', require('engine-handlebars'));

// engines like handlebars can handle a helper name with dashes
app.helper('link-to', require('helper-link-to'));
```
Use the helper in a handlebars template:

```hbs
<a href="{{link-to 'about'}}">About</a>
```

Creates output like:

```html
<a href="./about.html">About</a>
```

### With [verb](https://github.com/verbose/verb) and [engine-base](https://github.com/jonschlinkert/engine-base)

Setup the helper by registering it with the app:

```js
// verb is a descendant of `templates`
var app = verb();
app.engine('md', require('engine-base'));

// engines like `engine-base` cannot handle a helper name with dashes
app.helper('linkTo', require('helper-link-to'));
```
Use the helper in a template:

```md
 - [Getting Started][{%= linkTo("getting-started", "docs") %}]
```
Creates output like:

```md
 - [Getting Started][docs/getting-started.md]
```

## API

### [linkTo](index.js#L37)

[templates](https://github.com/jonschlinkert/templates) helper that creates a link from the current view to the specified view on the specified collection.

**Params**

* `key` **{String|Object}**: Name of the view to lookup to link to. May also pass in a view instance link to.
* `collectionName` **{String}**: Name of the collection to lookup the view on. (Defaults to "pages")
* `props` **{Array}**: Optional array of properties to check when getting the destination path from a view. May use dot notication (data.permalink). (Defaults to ["dest", "path"])
* `returns` **{String}**: Relative path to the specified view from the current view.

**Examples**

```hbs
{{! Handlebars example linking from "home.html" to "about.html" in the default "pages" collection }}
<a href="{{link-to 'about'}}">About</a>
```

```hbs
{{! Handlebars example linking from "home.html" to "blog/post-1.html" in the "posts" collection }}
<a href="{{link-to 'post-1' 'posts'}}">Post 1</a>
```

## About

### Related projects

* [assemble-core](https://www.npmjs.com/package/assemble-core): The core assemble application with no presets or defaults. All configuration is left to the… [more](https://github.com/assemble/assemble-core) | [homepage](https://github.com/assemble/assemble-core)
* [assemble](https://www.npmjs.com/package/assemble): Get the rocks out of your socks! Assemble makes you fast at creating web projects… [more](https://github.com/assemble/assemble) | [homepage](https://github.com/assemble/assemble)
* [engine-base](https://www.npmjs.com/package/engine-base): Default engine for Template. | [homepage](https://github.com/jonschlinkert/engine-base)
* [engine-handlebars](https://www.npmjs.com/package/engine-handlebars): Handlebars engine, consolidate.js style but with enhancements. This works with Assemble, express.js, engine-cache or any… [more](https://github.com/jonschlinkert/engine-handlebars) | [homepage](https://github.com/jonschlinkert/engine-handlebars)
* [generate](https://www.npmjs.com/package/generate): Command line tool and developer framework for scaffolding out new GitHub projects. Generate offers the… [more](https://github.com/generate/generate) | [homepage](https://github.com/generate/generate)
* [handlebars](https://www.npmjs.com/package/handlebars): Handlebars provides the power necessary to let you build semantic templates effectively with no frustration | [homepage](http://www.handlebarsjs.com/)
* [relative-dest](https://www.npmjs.com/package/relative-dest): Calculate the relative path from a file's destination path to another directory or file. | [homepage](https://github.com/jonschlinkert/relative-dest)
* [relative](https://www.npmjs.com/package/relative): Get the relative filepath from path A to path B. Calculates from file-to-directory, file-to-file, directory-to-file… [more](https://github.com/jonschlinkert/relative) | [homepage](https://github.com/jonschlinkert/relative)
* [templates](https://www.npmjs.com/package/templates): System for creating and managing template collections, and rendering templates with any node.js template engine… [more](https://github.com/jonschlinkert/templates) | [homepage](https://github.com/jonschlinkert/templates)
* [update](https://www.npmjs.com/package/update): Be scalable! Update is a new, open source developer framework and CLI for automating updates… [more](https://github.com/update/update) | [homepage](https://github.com/update/update)
* [verb](https://www.npmjs.com/package/verb): Documentation generator for GitHub projects. Verb is extremely powerful, easy to use, and is used… [more](https://github.com/verbose/verb) | [homepage](https://github.com/verbose/verb)

### Contributing

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](../../issues/new).

### Contributors

| **Commits** | **Contributor** |  
| --- | --- |  
| 31 | [doowb](https://github.com/doowb) |  
| 1  | [jonschlinkert](https://github.com/jonschlinkert) |

### Building docs

_(This project's readme.md is generated by [verb](https://github.com/verbose/verb-generate-readme), please don't edit the readme directly. Any changes to the readme must be made in the [.verb.md](.verb.md) readme template.)_

To generate the readme, run the following command:

```sh
$ npm install -g verbose/verb#dev verb-generate-readme && verb
```

### Running tests

Install dev dependencies:

```sh
$ npm install && npm test
```

### Author

**Brian Woodward**

* [github/doowb](https://github.com/doowb)
* [twitter/doowb](https://twitter.com/doowb)

### License

Copyright © 2017, [Brian Woodward](https://github.com/doowb).
MIT

***

_This file was generated by [verb-generate-readme](https://github.com/verbose/verb-generate-readme), v0.4.2, on February 09, 2017._