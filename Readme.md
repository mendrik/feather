# Featherₜₛ

<img src="http://cd.feather-ts.com/mendrik/feather/badge/?branch=master" height="20">&nbsp;<img src="http://dist.feather-ts.com/size.svg?v=1" height="20">&nbsp;<img src="http://www.feather-ts.com/images/licence.svg" height="20">

With friendly support of:

<a href="http://www.browserstack.com"><img src="http://www.feather-ts.com/images/browserstack.svg" width="92" height="20"></a>

---
A feather-light and fast framework written in typescript with the following features:

* Each component is holding logic, view and model in a single file
* Components automatically build a hierarchical tree
* Message hub between components and singletons
* Easy REST consumption
* Routing via hash or history API 
* Pure HTML templates without logic and a very simple binding syntax
* Event delegation out of the box
* Written in TypeScript
* No module loaders needed, embed directly via NPM
* With asynchronous decorators no need for _promises_
* Integrated media query based component views for responsive application design
* Support for modern browsers including IE9 (with polyfills)
* Component trees are initialized in off-screen document fragments for maximum performance.
* Access to up-tree properties without repetitive property clutter
* Generates clean HTML markup without any trace of the framework
* No wrappers required for your data holders
---

# Installation
```
npm install feather-ts
```
---

# Requirements

- NodeJS
- TypeScript
- experimentalDecorators=true in your *tsconfig.json*
- older browsers (IE11-) require polyfills for *classlist*, *treewalker*, *weakmap* and potentially others

## Optional

Intellij IDEA [plugin](http://dist.feather-ts.com/feather.jar) for syntax highlighting in templates. This 
will help you catch spelling errors or wrongly referenced properties inside string literals. 

# Usage & documentation

Check out the official [website](http://www.feather-ts.com)

# Tests

Feather-ts has a large set of automated tests to make sure each release comes without regressive bugs.

# Code examples

An example implementation of the famous todo application can be be found [here](http://todo.feather-ts.com/). 
Source maps are embedded.

A library of reusable UI components can be found [here](https://github.com/mendrik/feather-components). 
This is work in progress so use it only as in inspiration for your own implementations. 

# Performance

Comparing feather-ts using [this](https://github.com/lhorie/todomvc-perf-comparison) 

With 500 items:

<img src="http://dist.feather-ts.com/performance.jpg?v=1" style="width: 100%; max-width: 300px">
