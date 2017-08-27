# Featherₜₛ

<img src="http://cd.feather-ts.com/mendrik/feather/badge/?branch=master" height="20">&nbsp;<img src="http://dist.feather-ts.com/size.svg" height="20">&nbsp;<img src="http://www.feather-ts.com/images/licence.svg" height="20">

With friendly support of:

<a href="http://www.browserstack.com"><img src="http://www.feather-ts.com/images/browserstack.svg" width="92" height="20"></a>

---
**THIS PROJECT IS NOW IN ALPHA STAGE**

This means you can use it now for private projects.

A feather-light and fast* framework written in typescript with the following features:

* One-directional binding
* REST consumption
* Routing with HTML5 history API or URL hashes.
* Component and singleton messaging
* DOM event handling
* Templates are simple HTML
* Runs on modern browsers and IE9+
* Integrated media query evaluation in javascript
* Clean and simple code
* Local storage integration
* No promise clutter
* Internal properties are stored in hidden WeakMaps
* Less than 10kb gzipped
* No virtual dom overhead.
---

# Installation
```
npm install feather-ts --save
```
---

# Requirements

- nodejs
- typescript
- set experimentalDecorators=true in your *tsconfig.json*
- older browsers (IE11-) might require polyfills for *classlist*, *treewalker*, *weakmap* and others

# Usage

Check out the official [website](http://www.feather-ts.com)

# TodoMVC

An example implementation of the famous todo application can be be found [here](http://todo.feather-ts.com/). 
Source maps are embedded.

# Work to be done

- Complete documentation and usage examples
- Evaluate jsx style templates for better IDE support.

# Performance

Comparison between feather-ts using [this](https://github.com/Raynos/mercury-perf) 

- Backbone: 331.75999999999976
- Feather-ts: 158.2350000000015
- Knockout: 236.8100000000013
- Ember: 756.8700000000017
- Angular: 438.4150000000009
- React: 374.0599999999995
- Om: 268.04999999999836
- Om v: 259.09000000000196
- Ractive: 943.3650000000007
- Quiescent: 563.8299999999999
- Mercury: 108.71500000000015
- Mercury (thunks): 123.29999999999927
- Elm: 238.43500000000313
- Likely.js: 308.16999999999825
